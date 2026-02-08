export const RequestPOST = async(url, data) => {
    try {
        const response = await fetch(
            url,
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(data),
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error: Status: ${response.status}`);
        }
        return response.json();
    }
    catch (err) {
        console.log("Thrown an exception!");
        throw err;
    }
}