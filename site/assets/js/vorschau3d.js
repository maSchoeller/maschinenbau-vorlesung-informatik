/* =============================================================
   3D-Vorschau · window.Vorschau3D
   zeige(container, mesh)  -> Ansicht mit Drehen/Zoomen, Abmessungen, STL-Export
   stl(mesh)               -> ASCII-STL als Text
   mesh = { name, vertices: [[x,y,z],...], faces: [[i,j,k],...] }  (Einheit mm, z nach oben)
   three.js (r160) liegt lokal in ../vendor/three/ und wird erst beim ersten zeige() geladen.
   ============================================================= */
(function () {
  'use strict';

  var SKRIPT = (document.currentScript && document.currentScript.src) || '';
  var VENDOR = SKRIPT ? new URL('../vendor/three/', SKRIPT).href : 'assets/vendor/three/';
  var ladeVersprechen = null;

  function lade() {
    if (!ladeVersprechen) {
      ladeVersprechen = Promise.all([
        import(VENDOR + 'three.module.min.js'),
        import(VENDOR + 'OrbitControls.js')
      ]).then(function (m) { return { THREE: m[0], OrbitControls: m[1].OrbitControls }; });
      ladeVersprechen.catch(function () { ladeVersprechen = null; });
    }
    return ladeVersprechen;
  }

  /* ---------- Hilfen ohne three.js ---------- */

  function normalisiere(mesh) {
    if (typeof mesh === 'string') mesh = JSON.parse(mesh);
    if (!mesh || !Array.isArray(mesh.vertices) || !Array.isArray(mesh.faces)) {
      throw new Error('Mesh braucht "vertices" und "faces".');
    }
    return mesh;
  }

  function box(mesh) {
    var mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    mesh.vertices.forEach(function (v) {
      for (var a = 0; a < 3; a++) { if (v[a] < mn[a]) mn[a] = v[a]; if (v[a] > mx[a]) mx[a] = v[a]; }
    });
    if (!mesh.vertices.length) { mn = [0, 0, 0]; mx = [0, 0, 0]; }
    return { min: mn, max: mx, size: [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]] };
  }

  function zahl(x, stellen) {
    return x.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: stellen === undefined ? 1 : stellen });
  }

  function dateiname(name) {
    var s = String(name || 'bauteil').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return (s || 'bauteil') + '.stl';
  }

  function stl(mesh) {
    mesh = normalisiere(mesh);
    var v = mesh.vertices, name = String(mesh.name || 'bauteil').replace(/[\r\n]+/g, ' ');
    var f = function (x) { return String(Number(x.toPrecision(7))); };
    var out = ['solid ' + name];
    mesh.faces.forEach(function (t) {
      var a = v[t[0]], b = v[t[1]], c = v[t[2]];
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      var wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2];
      var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      out.push('  facet normal ' + f(nx / l) + ' ' + f(ny / l) + ' ' + f(nz / l));
      out.push('    outer loop');
      [a, b, c].forEach(function (p) { out.push('      vertex ' + f(p[0]) + ' ' + f(p[1]) + ' ' + f(p[2])); });
      out.push('    endloop');
      out.push('  endfacet');
    });
    out.push('endsolid ' + name);
    return out.join('\n') + '\n';
  }

  function herunterladen(text, name) {
    var blob = new Blob([text], { type: 'model/stl' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- Szene ---------- */

  // Geglättete Normalen nur über flache Übergänge (< ca. 30 Grad), harte Kanten bleiben scharf.
  function geometrie(THREE, mesh) {
    var V = mesh.vertices, F = mesh.faces, n = F.length;
    var fn = new Float32Array(n * 3), adj = new Array(V.length), i, k;
    for (i = 0; i < V.length; i++) adj[i] = [];
    for (i = 0; i < n; i++) {
      var a = V[F[i][0]], b = V[F[i][1]], c = V[F[i][2]];
      var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      var wx = c[0] - a[0], wy = c[1] - a[1], wz = c[2] - a[2];
      var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
      var l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      fn[i * 3] = nx / l; fn[i * 3 + 1] = ny / l; fn[i * 3 + 2] = nz / l;
      for (k = 0; k < 3; k++) adj[F[i][k]].push(i);
    }
    var pos = new Float32Array(n * 9), nor = new Float32Array(n * 9);
    for (i = 0; i < n; i++) {
      for (k = 0; k < 3; k++) {
        var vi = F[i][k], p = V[vi], o = i * 9 + k * 3;
        var sx = 0, sy = 0, sz = 0;
        adj[vi].forEach(function (j) {
          var d = fn[j * 3] * fn[i * 3] + fn[j * 3 + 1] * fn[i * 3 + 1] + fn[j * 3 + 2] * fn[i * 3 + 2];
          if (d > 0.866) { sx += fn[j * 3]; sy += fn[j * 3 + 1]; sz += fn[j * 3 + 2]; }
        });
        var sl = Math.sqrt(sx * sx + sy * sy + sz * sz) || 1;
        pos[o] = p[0]; pos[o + 1] = p[1]; pos[o + 2] = p[2];
        nor[o] = sx / sl; nor[o + 1] = sy / sl; nor[o + 2] = sz / sl;
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    return g;
  }

  function linie(THREE, a, b, farbe) {
    var g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a[0], a[1], a[2]), new THREE.Vector3(b[0], b[1], b[2])]);
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color: farbe }));
  }

  function baue(THREE, OrbitControls, stage, canvas, mesh, bb) {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xffffff, 1);

    var scene = new THREE.Scene();
    var dim = Math.max(bb.size[0], bb.size[1], bb.size[2], 1e-6);
    var mitte = new THREE.Vector3((bb.min[0] + bb.max[0]) / 2, (bb.min[1] + bb.max[1]) / 2, (bb.min[2] + bb.max[2]) / 2);
    var radius = Math.sqrt(bb.size[0] * bb.size[0] + bb.size[1] * bb.size[1] + bb.size[2] * bb.size[2]) / 2 || 1;

    var camera = new THREE.PerspectiveCamera(35, 1, radius / 100, radius * 100);
    camera.up.set(0, 0, 1);
    scene.add(camera);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfd4da, 1.5));
    var licht = new THREE.DirectionalLight(0xffffff, 1.4);
    licht.position.set(0.4, 0.6, 1);   // relativ zur Kamera: Licht kommt von oben links vorn
    camera.add(licht); camera.add(licht.target);
    licht.target.position.set(0, 0, -1);

    var geo = geometrie(THREE, mesh);
    var koerper = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({
      color: 0xd3d8de, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    }));
    scene.add(koerper);
    var kanten = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0x2a2f36 }));
    scene.add(kanten);

    // dezentes Raster in der Ebene z = min und Achsenkreuz an der Ecke
    var raster = Math.max(10, Math.pow(10, Math.floor(Math.log10(dim / 4))));
    var halb = Math.ceil((dim * 1.1) / raster / 2) * 2;
    var grid = new THREE.GridHelper(halb * raster, halb, 0xb4bac2, 0xe3e6ea);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(mitte.x, mitte.y, bb.min[2]);
    grid.material.transparent = true; grid.material.opacity = 0.9;
    scene.add(grid);
    var L = Math.max(dim * 0.35, raster), o = [bb.min[0] - dim * 0.05, bb.min[1] - dim * 0.05, bb.min[2]];
    scene.add(linie(THREE, o, [o[0] + L, o[1], o[2]], 0xa04848));
    scene.add(linie(THREE, o, [o[0], o[1] + L, o[2]], 0x3f8a5a));
    scene.add(linie(THREE, o, [o[0], o[1], o[2] + L], 0x3f68a8));

    var controls = new OrbitControls(camera, canvas);
    controls.target.copy(mitte);
    controls.enablePan = true;
    controls.minDistance = radius * 0.4;
    controls.maxDistance = radius * 12;
    controls.rotateSpeed = 0.9;

    var ansicht = new THREE.Vector3(1, -1.25, 0.85).normalize();
    function zuruecksetzen() {
      var d = radius / Math.sin((camera.fov * Math.PI / 180) / 2) * 1.05;
      camera.position.copy(mitte).addScaledVector(ansicht, d);
      controls.target.copy(mitte);
      camera.lookAt(mitte);
      controls.update();
      zeichne();
    }

    var rafOffen = false;
    function zeichne() {
      if (rafOffen) return;
      rafOffen = true;
      requestAnimationFrame(function () { rafOffen = false; renderer.render(scene, camera); });
    }
    controls.addEventListener('change', zeichne);

    function groesse() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      zeichne();
    }
    var ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(groesse) : null;
    if (ro) ro.observe(stage); else window.addEventListener('resize', groesse);

    // Tastatur: Pfeile drehen, + / - zoomen, 0 oder Pos1 setzt zurück
    var quat = new THREE.Quaternion(), sph = new THREE.Spherical(), off = new THREE.Vector3();
    function dreheUm(dTheta, dPhi) {
      off.copy(camera.position).sub(controls.target);
      quat.setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
      off.applyQuaternion(quat);
      sph.setFromVector3(off);
      sph.theta += dTheta;
      sph.phi = Math.min(Math.PI - 0.05, Math.max(0.05, sph.phi + dPhi));
      off.setFromSpherical(sph).applyQuaternion(quat.invert());
      camera.position.copy(controls.target).add(off);
      camera.lookAt(controls.target);
      controls.update();
      zeichne();
    }
    function zoome(faktor) {
      off.copy(camera.position).sub(controls.target);
      var d = Math.min(controls.maxDistance, Math.max(controls.minDistance, off.length() * faktor));
      off.setLength(d);
      camera.position.copy(controls.target).add(off);
      controls.update();
      zeichne();
    }
    function taste(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var s = e.shiftKey ? 0.35 : 0.12, k = e.key, ok = true;
      if (k === 'ArrowLeft') dreheUm(-s, 0);
      else if (k === 'ArrowRight') dreheUm(s, 0);
      else if (k === 'ArrowUp') dreheUm(0, -s);
      else if (k === 'ArrowDown') dreheUm(0, s);
      else if (k === '+' || k === '=' || k === 'Add') zoome(0.85);
      else if (k === '-' || k === '_' || k === 'Subtract') zoome(1 / 0.85);
      else if (k === '0' || k === 'Home') zuruecksetzen();
      else ok = false;
      if (ok) e.preventDefault();
    }
    stage.addEventListener('keydown', taste);

    groesse();
    zuruecksetzen();

    function entsorgen() {
      if (ro) ro.disconnect(); else window.removeEventListener('resize', groesse);
      stage.removeEventListener('keydown', taste);
      controls.dispose();
      geo.dispose(); kanten.geometry.dispose(); grid.geometry.dispose();
      renderer.dispose();
    }
    return { zuruecksetzen: zuruecksetzen, entsorgen: entsorgen };
  }

  /* ---------- Öffentliche API ---------- */

  var zaehler = 0;

  function zeige(container, mesh) {
    mesh = normalisiere(mesh);
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) throw new Error('Vorschau3D.zeige: Container nicht gefunden.');
    if (container.__v3d) { container.__v3d.entsorgen(); container.__v3d = null; }

    var bb = box(mesh);
    var name = String(mesh.name || 'Bauteil');
    var masse = zahl(bb.size[0]) + ' × ' + zahl(bb.size[1]) + ' × ' + zahl(bb.size[2]) + ' mm';
    var dreiecke = mesh.faces.length;
    var id = 'v3d-' + (++zaehler);

    container.textContent = '';
    var wurzel = el('div', 'v3d');
    var stage = el('div', 'v3d__stage');
    stage.tabIndex = 0;
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', '3D-Vorschau ' + name + ', Abmessungen ' +
      zahl(bb.size[0]) + ' mal ' + zahl(bb.size[1]) + ' mal ' + zahl(bb.size[2]) + ' Millimeter, ' + dreiecke + ' Dreiecke. ' +
      'Mit den Pfeiltasten drehen, mit Plus und Minus zoomen, mit Null zurücksetzen.');
    var hinweis = el('p', 'v3d__hint', 'Ziehen: drehen · Mausrad oder Zwei-Finger-Geste: zoomen · Pfeiltasten und + / −: per Tastatur bedienen');
    hinweis.id = id + '-h';
    stage.setAttribute('aria-describedby', hinweis.id);
    var laden = el('div', 'v3d__laden', 'Vorschau wird geladen …');
    stage.appendChild(laden);

    var leiste = el('div', 'v3d__bar');
    var bReset = el('button', 'v3d__btn', 'Ansicht zurücksetzen'); bReset.type = 'button';
    var bStl = el('button', 'v3d__btn', 'STL herunterladen'); bStl.type = 'button';
    var info = el('p', 'v3d__info');
    info.setAttribute('role', 'status');
    var b1 = el('b', null, name);
    info.appendChild(b1);
    info.appendChild(document.createTextNode(' · ' + masse + ' · ' + dreiecke.toLocaleString('de-DE') + ' Dreiecke'));
    leiste.appendChild(bReset); leiste.appendChild(bStl); leiste.appendChild(info);

    wurzel.appendChild(stage); wurzel.appendChild(hinweis); wurzel.appendChild(leiste);
    container.appendChild(wurzel);

    var zustand = { zuruecksetzen: function () {}, entsorgen: function () {} };
    var handle = {
      mesh: mesh,
      zuruecksetzen: function () { zustand.zuruecksetzen(); },
      entsorgen: function () { zustand.entsorgen(); if (container.__v3d === handle) container.__v3d = null; },
      stl: function () { return stl(mesh); }
    };
    container.__v3d = handle;

    bReset.addEventListener('click', function () { zustand.zuruecksetzen(); stage.focus(); });
    bStl.addEventListener('click', function () { herunterladen(stl(mesh), dateiname(name)); });
    bReset.disabled = true;

    function ausfall(grund) {
      stage.textContent = '';
      stage.classList.add('v3d__stage--fallback');
      stage.removeAttribute('tabindex');
      stage.setAttribute('aria-label', 'Keine 3D-Vorschau möglich für ' + name + ', Abmessungen ' + masse);
      stage.appendChild(el('div', 'v3d__fallback', grund + ' Die Maße stehen unten, die STL-Datei lässt sich trotzdem herunterladen und in einem CAD- oder Slicer-Programm öffnen.'));
      hinweis.hidden = true;
    }

    lade().then(function (m) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('aria-hidden', 'true');
      var testKontext = document.createElement('canvas');
      if (!(testKontext.getContext('webgl2') || testKontext.getContext('webgl'))) throw new Error('webgl');
      stage.appendChild(canvas);
      var ergebnis = baue(m.THREE, m.OrbitControls, stage, canvas, mesh, bb);
      laden.remove();
      zustand = ergebnis;
      bReset.disabled = false;
    }).catch(function (err) {
      var webgl = err && err.message === 'webgl';
      ausfall(webgl
        ? 'Dieser Browser oder dieses Gerät stellt keine 3D-Grafik (WebGL) bereit.'
        : 'Die 3D-Bibliothek konnte nicht geladen werden (bei lokal geöffneten Dateien ohne Server ist das normal).');
      if (!webgl && window.console) console.warn('Vorschau3D:', err);
    });

    return handle;
  }

  window.Vorschau3D = { zeige: zeige, stl: stl, version: 'three r160' };
})();
