export async function makeStatboticsRequest<T>(
	url: string,
	userAgent = "statbotics-app/1.0",
): Promise<T | null> {
	const headers = {
		"User-Agent": userAgent,
		Accept: "application/json",
	};

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return (await response.json()) as T;
	} catch (error) {
		console.error("Error making Statbotics request:", error);
		return null;
	}
}
