// Simple PDF certificate generator using PDFKit
// Generates a certificate for one purchase or a batch

const path = require('path')

function mm(v) {
  return v // PDFKit uses points; we’ll just use numbers directly
}

function loadPDFKit() {
  try {
    // Lazy require so the API still works if pdfkit not installed
    // (we’ll ask to install it and then it will work)
    // eslint-disable-next-line
    const PDFDocument = require('pdfkit')
    return PDFDocument
  } catch (e) {
    return null
  }
}

function header(doc, title) {
  doc
    .fillColor('#222')
    .fontSize(26)
    .font('Helvetica-Bold')
    .text('SpaceShop', { align: 'left' })
    .moveDown(0.2)
  doc
    .fontSize(12)
    .fillColor('#666')
    .font('Helvetica')
    .text(title)
  doc.moveDown(1)
}

function footer(doc) {
  const y = doc.page.height - 72
  doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e0e0e0').stroke()
  doc.fontSize(10).fillColor('#888').text('Document généré par SpaceShop', 50, y + 8, { align: 'left' })
}

function planetCard(doc, planet, price) {
  const startX = 50
  const width = doc.page.width - 100
  doc.roundedRect(startX, doc.y, width, 90, 8).fillOpacity(0.03).fill('#1a73e8').fillOpacity(1)
  const boxTop = doc.y
  doc.moveDown(0.5)
  doc.fillColor('#000').font('Helvetica-Bold').fontSize(14).text(planet.name, startX + 14, boxTop + 12)
  doc.font('Helvetica').fontSize(10).fillColor('#333')
  doc.text(`Type: ${planet.type}`, { continued: true }).text(`   Prix: ${Number(price ?? planet.price ?? 0).toFixed(2)} ¤`)
  doc.text(`Distance: ${planet.distance}    Diamètre: ${planet.diameter}`)
  doc.text(`Couleur: ${planet.color}    Taille: ${planet.size}`)
  doc.moveDown(0.8)
}

async function certificateForPurchase(res, { user, planet, purchase }) {
  const PDFDocument = loadPDFKit()
  if (!PDFDocument) {
    res.status(501).json({ success: false, error: 'Génération PDF indisponible: installez pdfkit' })
    return
  }
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  const filename = `certificate-${planet.name}.pdf`
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  doc.pipe(res)

  header(doc, 'Certificat d\'achat de planète')
  doc.fontSize(12).fillColor('#111').text(`Acheté par: ${user.email}`)
  doc.fillColor('#111').text(`Date: ${new Date(purchase.created_at || Date.now()).toLocaleString()}`)
  doc.moveDown(1)

  planetCard(doc, planet, purchase.price)

  doc.moveDown(1)
  doc.font('Helvetica-Oblique').fillColor('#333').text('Ce document atteste de l\'acquisition fictive de la planète mentionnée ci-dessus sur la plateforme SpaceShop.')

  doc.moveDown(3)
  doc.font('Helvetica').fillColor('#333').text('Signature: ____________________________')

  footer(doc)
  doc.end()
}

async function certificateForBatch(res, { user, items }) {
  const PDFDocument = loadPDFKit()
  if (!PDFDocument) {
    res.status(501).json({ success: false, error: 'Génération PDF indisponible: installez pdfkit' })
    return
  }
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  res.setHeader('Content-Type', 'application/pdf')
  const filename = `space-certificates-${Date.now()}.pdf`
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  doc.pipe(res)

  header(doc, 'Certificat d\'achat - Panier')
  doc.fontSize(12).fillColor('#111').text(`Acheté par: ${user.email}`)
  doc.fillColor('#111').text(`Date: ${new Date().toLocaleString()}`)
  doc.moveDown(1)

  let total = 0
  items.forEach(({ planet, purchase }) => {
    const price = Number(purchase?.price ?? planet.price ?? 0)
    total += price
    planetCard(doc, planet, price)
    doc.moveDown(0.5)
  })

  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111').text(`Total: ${total.toFixed(2)} ¤`)
  doc.moveDown(2)
  doc.font('Helvetica-Oblique').fillColor('#333').text('Ces certificats attestent de l\'acquisition fictive des planètes listées ci‑dessus sur SpaceShop.')

  doc.moveDown(3)
  doc.font('Helvetica').fillColor('#333').text('Signature: ____________________________')

  footer(doc)
  doc.end()
}

module.exports = { certificateForPurchase, certificateForBatch }

