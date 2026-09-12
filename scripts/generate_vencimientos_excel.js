const ExcelJS = require('exceljs');
const path = require('path');
const os = require('os');

const data = [
  {
    num: "ORD-00911",
    cliente: "Kamila Sofia Ortiz Rios",
    telefono: "+573207325688",
    servicio: "Disney+ Premium 7 ESPN (1 mes)",
    correo_cuenta: "ranchera@digitalvnhe.com",
    perfil: "3",
    pin: "9640",
    clave: "7890zeus@@+",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00910",
    cliente: "Kamila Sofia Ortiz Rios",
    telefono: "+573207325688",
    servicio: "Prime Video Pantalla (1 mes)",
    correo_cuenta: "thech7544@outlook.com",
    perfil: "6",
    pin: "6666",
    clave: "prime100",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00909",
    cliente: "Kamila Sofia Ortiz Rios",
    telefono: "+573207325688",
    servicio: "Crunchyroll Pantalla (1 mes)",
    correo_cuenta: "akexs1344@gmail.com",
    perfil: "3",
    pin: "7373",
    clave: "buzon2005",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00908",
    cliente: "Kamila Sofia Ortiz Rios",
    telefono: "+573207325688",
    servicio: "Netflix Original Pantalla (1 mes)",
    correo_cuenta: "SandySpiwak19623@outlook.com",
    perfil: "4",
    pin: "9494",
    clave: "Stream_Zone*1",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00907",
    cliente: "Kamila Sofia Ortiz Rios",
    telefono: "+573207325688",
    servicio: "Viki Rakuten 1 Dispositivo (1 mes)",
    correo_cuenta: "vikyus86435@jyfshops.com",
    perfil: "2",
    pin: "N/A",
    clave: "Hide330033#",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00902",
    cliente: "Kamila Sofia Ortiz Rios",
    telefono: "+573207325688",
    servicio: "Prime Video Pantalla (1 mes)",
    correo_cuenta: "thech7544@outlook.com",
    perfil: "5",
    pin: "5555",
    clave: "prime100",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00906",
    cliente: "Miguel Angel Castellanos",
    telefono: "+573024818466",
    servicio: "Netflix Original Pantalla (1 mes)",
    correo_cuenta: "SandySpiwak19623@outlook.com",
    perfil: "3",
    pin: "9393",
    clave: "Stream_Zone*1",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00905",
    cliente: "Tharyn Uribe",
    telefono: "+573046629966",
    servicio: "Crunchyroll Pantalla (1 mes)",
    correo_cuenta: "akexs1344@gmail.com",
    perfil: "2",
    pin: "7272",
    clave: "buzon2005",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00904",
    cliente: "Lizeth Dayanna Goyeneche",
    telefono: "+573213557196",
    servicio: "Netflix Original Pantalla (1 mes)",
    correo_cuenta: "SandySpiwak19623@outlook.com",
    perfil: "2",
    pin: "9292",
    clave: "Stream_Zone*1",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  },
  {
    num: "ORD-00903",
    cliente: "Joan Nicolas Viasus",
    telefono: "+573137823224",
    servicio: "Netflix Original Pantalla (1 mes)",
    correo_cuenta: "SandySpiwak19623@outlook.com",
    perfil: "1",
    pin: "9191",
    clave: "Stream_Zone*1",
    fecha_corte: "06/09/2026",
    estado: "Vence Hoy"
  }
];

async function generate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Nix-on-Droid (Stream Zone Admin)';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Vencimientos Hoy', {
    properties: { tabColor: { argb: 'FF0D47A1' } },
    views: [{ showGridLines: true }]
  });

  // Título principal
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = '🎬 STREAM ZONE — DESGLOSE DE VENCIMIENTOS DE HOY (06/09/2026)';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D233A' }
  };
  worksheet.getRow(1).height = 36;

  // Subtítulo / Info
  worksheet.mergeCells('A2:J2');
  const subCell = worksheet.getCell('A2');
  subCell.value = 'Reporte oficial de clientes con corte hoy • Cuentas, correos y perfiles afectados para renovación o corte';
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FFB0BEC5' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A365D' }
  };
  worksheet.getRow(2).height = 20;

  // Espacio
  worksheet.getRow(3).height = 10;

  // Encabezados de tabla
  const headers = [
    { header: '#', key: 'idx', width: 6 },
    { header: 'Orden', key: 'num', width: 14 },
    { header: 'Cliente', key: 'cliente', width: 28 },
    { header: 'WhatsApp / Teléfono', key: 'telefono', width: 22 },
    { header: 'Servicio Contratado', key: 'servicio', width: 34 },
    { header: 'Correo Afectado', key: 'correo_cuenta', width: 32 },
    { header: 'Perfil', key: 'perfil', width: 10 },
    { header: 'PIN', key: 'pin', width: 10 },
    { header: 'Contraseña Cuenta', key: 'clave', width: 20 },
    { header: 'Estado', key: 'estado', width: 16 }
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;

  headers.forEach((h, i) => {
    const colIndex = i + 1;
    worksheet.getColumn(colIndex).width = h.width;
    const cell = headerRow.getCell(colIndex);
    cell.value = h.header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' }
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF0D233A' } },
      left: { style: 'thin', color: { argb: 'FF2563EB' } },
      bottom: { style: 'medium', color: { argb: 'FF0D233A' } },
      right: { style: 'thin', color: { argb: 'FF2563EB' } }
    };
  });

  // Filas de datos
  data.forEach((item, index) => {
    const rowIdx = index + 5;
    const row = worksheet.getRow(rowIdx);
    row.height = 22;

    const rowData = [
      index + 1,
      item.num,
      item.cliente,
      item.telefono,
      item.servicio,
      item.correo_cuenta,
      item.perfil,
      item.pin,
      item.clave,
      item.estado
    ];

    const isEven = index % 2 === 0;
    const rowBg = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

    rowData.forEach((val, cIdx) => {
      const cell = row.getCell(cIdx + 1);
      cell.value = val;
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: rowBg }
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };

      // Alineaciones específicas
      if (cIdx === 0 || cIdx === 1 || cIdx === 6 || cIdx === 7 || cIdx === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (cIdx === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      }

      // Estilo de badge para el Estado
      if (cIdx === 9) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' } // amarillo pastel
        };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFB45309' } };
      }

      // Perfil resaltado
      if (cIdx === 6) {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1D4ED8' } };
      }

      // Cliente en negrita
      if (cIdx === 2) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      }
    });
  });

  // Pie de resumen
  const totalRowIdx = data.length + 6;
  const totalRow = worksheet.getRow(totalRowIdx);
  totalRow.height = 24;
  worksheet.mergeCells(`A${totalRowIdx}:E${totalRowIdx}`);
  const totalLabel = worksheet.getCell(`A${totalRowIdx}`);
  totalLabel.value = `TOTAL DE CUENTAS / PERFILES QUE VENCEN HOY: ${data.length}`;
  totalLabel.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  totalLabel.alignment = { vertical: 'middle', horizontal: 'center' };
  totalLabel.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0D233A' }
  };

  worksheet.mergeCells(`F${totalRowIdx}:J${totalRowIdx}`);
  const totalSub = worksheet.getCell(`F${totalRowIdx}`);
  totalSub.value = 'Clientes únicos: 5 | Renovaciones pendientes';
  totalSub.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFE2E8F0' } };
  totalSub.alignment = { vertical: 'middle', horizontal: 'center' };
  totalSub.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' }
  };

  const outputPath = path.join(os.homedir(), 'storage/downloads/Vencimientos_StreamZone_Hoy_06_09_2026.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`EXCEL_GENERADO: ${outputPath}`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
