export const RequestPOST = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (err) {
    console.log("Thrown an exception!");
    throw err;
  }
};

export const RequestGET = async (url) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: Status: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.log("Exception thrown during GET request");
    throw err;
  }
};
