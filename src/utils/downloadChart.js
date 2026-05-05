import html2canvas from 'html2canvas'

export async function downloadChart(ref, filename = 'chart.png', format = 'png') {
  if (!ref.current) return
  const canvas = await html2canvas(ref.current, { backgroundColor: '#0d1f2d', scale: 2 })
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL(mime, 0.92)
  link.click()
}
