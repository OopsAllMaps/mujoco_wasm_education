import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';

async function buildScormPackage() {
  const zip = new JSZip();

  // Add SCORM manifest
  const imsmanifest = `<?xml version="1.0" standalone="no" ?>
<manifest identifier="MujocoSimulation" version="1"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                             http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                             http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="MujocoSimDefault">
    <organization identifier="MujocoSimDefault">
      <title>MuJoCo Simulation</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>MuJoCo Simulation</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="dist/mujoco_wasm.js"/>
      <file href="dist/mujoco_wasm.wasm"/>
      <file href="examples/main.js"/>
      <file href="examples/mujocoUtils.js"/>
      <file href="examples/utils/DragStateManager.js"/>
      <file href="node_modules/three/build/three.module.js"/>
      <file href="node_modules/three/examples/jsm/libs/lil-gui.module.min.js"/>
      <file href="node_modules/three/examples/jsm/controls/OrbitControls.js"/>
      <file href="scorm/scorm-wrapper.js"/>
    </resource>
  </resources>
</manifest>`;

  zip.file('imsmanifest.xml', imsmanifest);

  // Copy required files
  const filesToCopy = [
    'index.html',
    'dist/mujoco_wasm.js',
    'dist/mujoco_wasm.wasm',
    'examples/main.js',
    'examples/mujocoUtils.js',
    'examples/utils/DragStateManager.js',
    'node_modules/three/build/three.module.js',
    'node_modules/three/examples/jsm/libs/lil-gui.module.min.js',
    'node_modules/three/examples/jsm/controls/OrbitControls.js',
    'scorm/scorm-wrapper.js'
  ];

  for (const file of filesToCopy) {
    try {
      const content = await fs.readFile(file);
      zip.file(file, content);
    } catch (err) {
      console.error(`Error copying file ${file}:`, err);
    }
  }

  // Generate zip file
  const content = await zip.generateAsync({ type: 'nodebuffer' });
  await fs.mkdir('dist/scorm', { recursive: true });
  await fs.writeFile('dist/scorm/mujoco-simulation.zip', content);
  
  console.log('SCORM package created successfully at dist/scorm/mujoco-simulation.zip');
}

buildScormPackage().catch(console.error);
