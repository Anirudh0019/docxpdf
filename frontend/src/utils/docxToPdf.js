export async function convertDocxToPdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:5000/convert', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Conversion failed');
  }

  return await response.blob();
}
