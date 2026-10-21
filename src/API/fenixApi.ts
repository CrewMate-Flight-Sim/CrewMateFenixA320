const FENIX_GRAPHQL_URL = "http://localhost:8083/graphql"

// Quiet on failure: it is polled, and Fenix not running yet is normal
export async function readDataRef(name: string): Promise<string | null> {
  try {
    const response = await fetch(FENIX_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query ($name: String!) { dataRef { value: dataRef(name: $name) { value } } }",
        variables: { name }
      })
    })
    const result = (await response.json()) as { data?: { dataRef?: { value?: { value?: unknown } } } }
    const value = result.data?.dataRef?.value?.value
    return typeof value === "string" ? value : null
  } catch {
    return null
  }
}

export async function writeDataRef(name: string, value: boolean): Promise<boolean> {
  try {
    const response = await fetch(FENIX_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "mutation ($name: String!, $value: Boolean!) { dataRef { writeBool(name: $name, value: $value) } }",
        variables: { name, value }
      })
    })
    const result = (await response.json()) as { errors?: unknown }
    if (!response.ok || result.errors) throw new Error(JSON.stringify(result.errors ?? response.status))
    return true
  } catch (error) {
    console.error(`[Fenix] Failed to write ${name}:`, error)
    return false
  }
}
