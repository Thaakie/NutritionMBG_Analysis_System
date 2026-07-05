export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export async function fetchFoods() {
  const response = await fetch(`${API_BASE}/api/foods`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Gagal mengambil data bahan dari database.");
  }

  const data = await response.json();
  return data.items;
}

export async function createFoodInDb(food) {
  const response = await fetch(`${API_BASE}/api/foods`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(food),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Gagal menyimpan bahan ke database.");
  }

  return response.json();
}

export async function updateFoodInDb(id, food) {
  const response = await fetch(`${API_BASE}/api/foods/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(food),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Gagal mengupdate bahan di database.");
  }

  return response.json();
}

export async function deleteFoodFromDb(id) {
  const response = await fetch(`${API_BASE}/api/foods/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Gagal menghapus bahan dari database.");
  }

  return response.json();
}

export async function fetchOptimizationHistory(limit = 100) {
  const response = await fetch(`${API_BASE}/api/optimization-history?limit=${limit}`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Gagal mengambil riwayat optimasi.");
  }

  const data = await response.json();
  return data.items;
}
