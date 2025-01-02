class Session {
	public static set(key: string, value: string): void {
		return localStorage.setItem(key, value);
	}

	public static get(key: string): string | null {
		return localStorage.getItem(key);
	}
}

export default Session;
