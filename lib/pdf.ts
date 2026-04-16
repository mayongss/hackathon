export async function exportToPdf(elementId: string, filename: string) {
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).default

  const element = document.getElementById(elementId)
  if (!element) throw new Error('Element not found')

  const canvas = await html2canvas(element, { scale: 2, useCORS: true })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
  pdf.save(filename)
}
