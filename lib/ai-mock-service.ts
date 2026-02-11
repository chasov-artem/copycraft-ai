type MockGenerationData = Record<string, string>

function pickValue(formData: MockGenerationData, keys: string[], fallback: string): string {
  for (const key of keys) {
    const value = String(formData[key] ?? "").trim()
    if (value) {
      return value
    }
  }
  return fallback
}

export async function mockAIGeneration(
  templateId: string,
  formData: MockGenerationData
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  if (Math.random() < 0.1) {
    throw new Error("AI сервіс тимчасово недоступний. Спробуйте ще раз.")
  }

  const propertyType = pickValue(formData, ["propertyType", "objectName", "businessType"], "об'єкт")
  const location = pickValue(formData, ["location", "district"], "зручному районі")
  const highlights = pickValue(formData, ["keyFeatures", "mainBenefit", "condition"], "сучасним плануванням")
  const price = pickValue(formData, ["price", "monthlyPrice", "rentalRate"], "узгоджується")
  const area = pickValue(formData, ["area", "houseArea", "landArea"], "")
  const callToAction = pickValue(
    formData,
    ["callToAction"],
    "Зв'яжіться з нами, щоб домовитися про перегляд."
  )

  const areaSentence = area ? ` Загальна площа: ${area}.` : ""

  return [
    `Шаблон: ${templateId}.`,
    `Пропонуємо ${propertyType} у ${location}, який вирізняється ${highlights}.${areaSentence}`,
    `Орієнтовна ціна: ${price}.`,
    "Об'єкт підійде як для комфортного проживання, так і для вигідної інвестиції.",
    callToAction,
  ].join(" ")
}
