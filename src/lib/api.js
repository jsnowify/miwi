export async function api(path, { body, ...options } = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(result.message || 'Unable to connect. Please try again.'), { status: response.status });
  return result;
}
export async function uploadImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) throw new Error('Choose a PNG, JPEG or WebP image under 2 MB.');
  const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
  return api('/media', { method: 'POST', body: { data, type: file.type } });
}