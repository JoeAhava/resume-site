import React, { useState, useEffect } from "react";
import {
	pipeline,
	TextGenerationPipeline,
	type Pipeline,
} from "@xenova/transformers";
import resumeData from "./assets/resume_data.json";

interface Experience {
	company: string;
	role: string;
	years: string;
	description: string;
	skills: string[];
}

interface ResumeData {
	name: string;
	title: string;
	summary: string;
	experience: Experience[];
	skills: string[];
}

const data: ResumeData = resumeData;

const ChatBot: React.FC = () => {
	const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>(
		[],
	);
	const [input, setInput] = useState("");
	const [chatModel, setChatModel] = useState<
		TextGenerationPipeline | Pipeline | null
	>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadModel = async () => {
			try {
				const model = await pipeline("text-generation", "xenova/gpt2");
				setChatModel(model);
			} catch (error) {
				console.error("Failed to load model:", error);
			} finally {
				setLoading(false);
			}
		};
		loadModel();
	}, []);

	const handleSend = async () => {
		if (!input.trim() || !chatModel) return;
		const userMessage = { text: input, isUser: true };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");

		const botResponse = await generateResponse(input);
		setMessages((prev) => [...prev, botResponse]);
	};

	// 🔹 Extracts relevant details from resumeData
	const getRelevantInfo = (query: string) => {
		const lowerQuery = query.toLowerCase();

		// If question is about skills
		if (lowerQuery.includes("skills") || lowerQuery.includes("expertise")) {
			return `I have experience in: ${data.skills.join(", ")}.`;
		}

		// If question is about experience
		for (const exp of data.experience) {
			if (
				lowerQuery.includes(exp.company.toLowerCase()) ||
				lowerQuery.includes(exp.role.toLowerCase())
			) {
				return `I worked as a ${exp.role} at ${exp.company} for ${exp.years}. ${exp.description}`;
			}
		}

		// General fallback (summary)
		return data.summary;
	};

	const generateResponse = async (query: string) => {
		if (!chatModel) return { text: "Model is still loading...", isUser: false };

		try {
			// Get relevant resume info based on query
			const resumeContext = getRelevantInfo(query);

			// Create a structured prompt
			const prompt = `You are Yohannes Terfa, a professional. Answer based on your resume:\n\nResume Info:\n${resumeContext}\n\nUser: ${query}\nAI:`;

			const response = await chatModel(prompt, { max_new_tokens: 100 });

			return {
				text: response[0]?.generated_text || "Sorry, I didn't get that.",
				isUser: false,
			};
		} catch (error) {
			console.error("Error generating response:", error);
			return { text: "Something went wrong. Please try again.", isUser: false };
		}
	};

	return (
		<div className="max-w-lg mx-auto p-4 border rounded shadow-lg">
			<h2 className="text-xl font-bold">Chat with Yohannes</h2>
			{loading && <p className="text-gray-500">Loading AI model...</p>}
			<div className="h-64 overflow-y-auto border p-2 mt-2">
				{messages.map((msg, index) => (
					<div
						key={index}
						className={`p-2 ${msg.isUser ? "text-right" : "text-left"}`}
					>
						<span
							className={
								msg.isUser
									? "bg-blue-500 text-white p-1 rounded"
									: "bg-gray-300 p-1 rounded"
							}
						>
							{msg.text}
						</span>
					</div>
				))}
			</div>
			<div className="mt-2 flex">
				<input
					className="flex-1 border p-2"
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder={loading ? "AI is loading..." : "Ask me something..."}
					disabled={loading}
				/>
				<button
					className="ml-2 bg-blue-500 text-white p-2 rounded"
					onClick={handleSend}
					disabled={loading}
				>
					Send
				</button>
			</div>
		</div>
	);
};

export default ChatBot;
