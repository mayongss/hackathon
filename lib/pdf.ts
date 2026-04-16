export async function exportToPdf(elementId: string, filename: string) {
  const html2canvas = (await import('html2canvas')).default
  const jsPDF = (await import('jspdf')).default

  const element = document.getElementById(elementId)
  if (!element) throw new Error('Element not found')

  const canvas = await html2canvas(element, { scale: 1, useCORS: true, logging: false })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 10

  // 첫 페이지
  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
  heightLeft -= (pageHeight - 20)

  // 내용이 길면 다음 페이지 추가
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10 // 위로 끌어올려서 그리기
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= (pageHeight - 20)
  }

  pdf.save(filename)
}
