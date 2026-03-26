import { tavily as Tavily } from "@tavily/core";

export const searchInternet = async (query) => {
    const tavily = new Tavily({
        apiKey: process.env.TAVILY_API_KEY,
    });

    if(!process.env.TAVILY_API_KEY){
        throw new Error("Tavily API key is not set in environment variables");
    }

    return await tavily.search(query, {
        maxResults: 5,
        searchDepth: "advanced"
    });

}
