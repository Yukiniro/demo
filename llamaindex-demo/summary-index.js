import { Document, SummaryIndex, SummaryRetrieverMode } from "llamaindex";
import essay from "./public/essay.js";

async function main() {
  console.log("Starting summary index...");
  const document = new Document({ text: essay });

  console.log("Creating index...");
  const index = await SummaryIndex.fromDocuments([document]);
  console.log("Index created");

  console.log("Creating chat engine...");
  const chatEngine = index.asChatEngine({
    mode: SummaryRetrieverMode.LLM,
  });
  console.log("Chat engine created");

  console.log("Chatting...");
  const response = await chatEngine.chat({
    message: "Summary about the author",
  });
  console.log("Chat completed");

  console.log(response.message.content);
}

main().catch(console.error);
