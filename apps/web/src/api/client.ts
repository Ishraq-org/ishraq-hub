export interface ApiRequestOptions extends RequestInit {
  data?: any;
}

export const apiClient = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { data, headers: customHeaders, ...customConfig } = options;

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    credentials: 'include', // Ensures HTTP-only ishraq_session cookie is sent
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, config);

  let responseData: any = {};
  try {
    responseData = await response.json();
  } catch {
    // If response body is empty or non-JSON
  }

  if (!response.ok) {
    const message =
      responseData?.error ||
      responseData?.message ||
      `HTTP Error ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return responseData as T;
};

export default apiClient;
