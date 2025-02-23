import { pipeline } from "@xenova/transformers";

const loadModel = async () => {
	const chatModel = await pipeline("text-generation", "Xenova/gpt2");
	console.log("Model loaded successfully!");
	return chatModel;
};

export default loadModel;
