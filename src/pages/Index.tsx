
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, HelpCircle, Trash2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const cdpTypes = ["Segment", "mParticle", "Lytics", "Zeotap", "General"];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your CDP Support Agent. How can I help you today? You can ask me how-to questions about Segment, mParticle, Lytics, or Zeotap.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCDP, setSelectedCDP] = useState<string>("General");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample questions for each CDP
  const sampleQuestions = {
    Segment: [
      "How do I set up a new source in Segment?",
      "How can I create a new workspace in Segment?",
      "How do I track custom events with Segment?",
    ],
    mParticle: [
      "How can I create a user profile in mParticle?",
      "How do I implement mParticle SDK?",
      "How can I set up data forwarding in mParticle?",
    ],
    Lytics: [
      "How do I build an audience segment in Lytics?",
      "How can I connect a data source to Lytics?",
      "How do I use Lytics for personalization?",
    ],
    Zeotap: [
      "How can I integrate my data with Zeotap?",
      "How do I create segments in Zeotap?",
      "How can I use Zeotap for campaign activation?",
    ],
    General: [
      "How does Segment's audience creation compare to Lytics'?",
      "What are the key differences between mParticle and Zeotap?",
      "Which CDP is best for e-commerce businesses?",
    ],
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // In a real application, this would call your backend API that integrates with OpenAI
      // For now, we'll simulate a response with a timeout
      setTimeout(() => {
        const response = simulateResponse(input, selectedCDP);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error getting response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const simulateResponse = (question: string, cdpType: string): string => {
    // This is a placeholder function that simulates responses
    // In a real application, this would be replaced with actual OpenAI API calls
    
    const lowerQuestion = question.toLowerCase();
    
    // Handle irrelevant questions
    if (lowerQuestion.includes("movie") || lowerQuestion.includes("weather") || lowerQuestion.includes("sports")) {
      return "I'm specifically designed to help with CDP-related questions. I can answer how-to questions about Segment, mParticle, Lytics, and Zeotap. Please ask me something related to these platforms.";
    }

    // Basic responses based on CDP type and question content
    if (cdpType === "Segment" || lowerQuestion.includes("segment")) {
      if (lowerQuestion.includes("source") || lowerQuestion.includes("set up")) {
        return "To set up a new source in Segment:\n\n1. Log in to your Segment workspace\n2. Navigate to Sources > Add Source\n3. Select the type of source you want to add (e.g., Website, Server, Mobile App)\n4. Follow the configuration steps for your specific source type\n5. Get your write key and implement the Segment snippet in your application\n\nFor more detailed instructions, refer to the [Segment documentation](https://segment.com/docs/connections/sources/).";
      }
      return "Segment is a CDP that helps you collect, clean, and control your customer data. For specific guidance, please ask a more detailed question about Segment functionality.";
    }
    
    if (cdpType === "mParticle" || lowerQuestion.includes("mparticle")) {
      if (lowerQuestion.includes("profile") || lowerQuestion.includes("user profile")) {
        return "To create a user profile in mParticle:\n\n1. Implement the mParticle SDK in your application\n2. Use the `Identity` API to identify users\n3. Set user attributes using the `User Attributes` API\n4. Track user events that will enrich the profile\n\nUser profiles in mParticle are automatically created when you identify a user and start sending data. For more information, check the [mParticle Identity documentation](https://docs.mparticle.com/guides/idsync/introduction/).";
      }
      return "mParticle is a customer data platform that helps you collect and connect your data. For specific guidance, please ask a more detailed question about mParticle functionality.";
    }
    
    if (cdpType === "Lytics" || lowerQuestion.includes("lytics")) {
      if (lowerQuestion.includes("audience") || lowerQuestion.includes("segment")) {
        return "To build an audience segment in Lytics:\n\n1. Navigate to the Audiences section in your Lytics dashboard\n2. Click 'Create New Audience'\n3. Define your audience criteria using the visual segment builder\n4. Add filters based on user behaviors, attributes, or content affinities\n5. Preview your audience size and save the segment\n\nLytics allows you to create segments based on real-time behavioral data and machine learning insights. For more details, see the [Lytics Audience documentation](https://docs.lytics.com/product/build/audiences/).";
      }
      return "Lytics is a CDP focused on behavioral data and machine learning. For specific guidance, please ask a more detailed question about Lytics functionality.";
    }
    
    if (cdpType === "Zeotap" || lowerQuestion.includes("zeotap")) {
      if (lowerQuestion.includes("integrate") || lowerQuestion.includes("data")) {
        return "To integrate your data with Zeotap:\n\n1. Log in to your Zeotap account\n2. Go to the Integrations section\n3. Select the data source type you want to connect\n4. Configure the connection parameters\n5. Set up the data mapping\n6. Validate and activate the integration\n\nZeotap supports various integration methods including API, SDK, and direct file uploads. For more information, refer to the [Zeotap Integration documentation](https://docs.zeotap.com/home/en-us/category/integrations).";
      }
      return "Zeotap is a customer intelligence platform that helps you unify and activate your data. For specific guidance, please ask a more detailed question about Zeotap functionality.";
    }
    
    // Cross-CDP comparisons (for bonus feature)
    if (lowerQuestion.includes("compare") || lowerQuestion.includes("difference") || lowerQuestion.includes("versus") || lowerQuestion.includes("vs")) {
      if (lowerQuestion.includes("segment") && lowerQuestion.includes("lytics")) {
        return "Comparing Segment and Lytics:\n\n**Segment** focuses on data collection and routing, acting primarily as a data router that sends data to various destinations. It's excellent for collecting data from multiple sources and distributing it to different tools.\n\n**Lytics** specializes in audience building and activation with a strong focus on ML-powered behavioral analysis. It excels at creating detailed user segments based on behavior patterns.\n\nFor audience creation specifically:\n- Segment offers basic audience capabilities through Personas, with rule-based segment building\n- Lytics provides more advanced audience building with ML-powered behavioral scoring and predictive modeling\n\nThe choice depends on whether you prioritize data routing (Segment) or advanced audience insights (Lytics).";
      }
      
      if (lowerQuestion.includes("mparticle") && lowerQuestion.includes("zeotap")) {
        return "Comparing mParticle and Zeotap:\n\n**mParticle** is a comprehensive CDP focused on data collection, identity resolution, and audience management across multiple channels. It has strong mobile SDK capabilities and real-time data processing.\n\n**Zeotap** positions itself as a customer intelligence platform with a focus on identity resolution and enrichment with third-party data. It has particularly strong capabilities in the telecom and mobile sectors.\n\nKey differences:\n- mParticle has stronger development-focused tools and SDKs\n- Zeotap offers more third-party data enrichment capabilities\n- mParticle provides more granular data controls\n- Zeotap has specialized features for telecom and mobile operators";
      }
      
      return "When comparing CDPs, it's important to consider your specific needs. Each platform has different strengths:\n\n- **Segment** excels at data collection and routing\n- **mParticle** specializes in mobile use cases and complex identity resolution\n- **Lytics** focuses on behavioral analysis and ML-powered segments\n- **Zeotap** emphasizes identity resolution and data enrichment\n\nFor a more specific comparison, please mention which two CDPs you'd like to compare.";
    }
    
    // Generic response for how-to questions that don't match specific patterns
    if (lowerQuestion.includes("how")) {
      return `I'd be happy to help you with that. To provide the most accurate guidance about ${cdpType !== "General" ? cdpType : "CDP platforms"}, could you please specify which feature or task you're trying to accomplish? The more details you provide, the better I can assist you.`;
    }
    
    // Default response
    return `I understand you're asking about ${cdpType !== "General" ? cdpType : "CDPs"}. To help you better, could you phrase your question as a specific "how-to" question? For example, "How do I set up a connection in ${cdpType !== "General" ? cdpType : "a CDP"}?" or "How can I create a segment in ${cdpType !== "General" ? cdpType : "a CDP platform"}?"`;
  };

  const handleSampleQuestion = (question: string) => {
    setInput(question);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'm your CDP Support Agent. How can I help you today? You can ask me how-to questions about Segment, mParticle, Lytics, or Zeotap.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b p-4 bg-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CDP Support Agent</h1>
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto py-4 px-4 md:px-8 flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Sample Questions
              </CardTitle>
              <CardDescription>
                Select a CDP to see example questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="General" onValueChange={setSelectedCDP}>
                <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4">
                  {cdpTypes.map((cdp) => (
                    <TabsTrigger key={cdp} value={cdp}>
                      {cdp}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(sampleQuestions).map(([cdp, questions]) => (
                  <TabsContent key={cdp} value={cdp} className="mt-0">
                    <ul className="space-y-2">
                      {questions.map((question, index) => (
                        <li key={index}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left h-auto py-2"
                            onClick={() => handleSampleQuestion(question)}
                          >
                            {question}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Chat Area */}
        <div className="flex-grow flex flex-col">
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle>Chat with CDP Support Agent</CardTitle>
              <CardDescription>
                Ask how-to questions about Segment, mParticle, Lytics, or Zeotap
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-4 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse h-2 w-2 rounded-full bg-primary"></div>
                          <div className="animate-pulse h-2 w-2 rounded-full bg-primary animation-delay-200"></div>
                          <div className="animate-pulse h-2 w-2 rounded-full bg-primary animation-delay-400"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="w-full flex gap-2">
                <Input
                  type="text"
                  placeholder="Ask a question about CDPs..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        <p>
          CDP Support Agent — Powered by AI. Simulating responses for demonstration purposes.
        </p>
      </footer>
    </div>
  );
};

export default Index;
