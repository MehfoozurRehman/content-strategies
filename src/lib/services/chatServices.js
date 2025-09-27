import { ShowCustomToast } from "@/app/customComponents/CustomToastify";
import axiosInstance from "../axiosMiddleware";

export const sendChats = async ({
    user_id,                   // string (required)
    context_document_ids = [],  // array of strings
    source_document_ids = [],   // array of strings
    uploaded_document_ids = [], // array of strings
    add_ons = {},              // object
    prompt_id = '',         // string
    prompt = '',               // string (required)
    conversation_id = ''       // string
}) => {
    try {
        // Validate required parameters
        if (!user_id) throw new Error('user_id is required');
        if (!prompt) throw new Error('prompt is required');

        // Create payload with exact parameter names
        const payload = {
            context_document_ids,
            source_document_ids,
            uploaded_document_ids,
            add_ons,
            prompt_id,
            prompt,
            conversation_id: conversation_id || `conv-${Date.now()}`,
            user_id
        };

        console.log('Sending chat payload:', payload);

        const response = await axiosInstance.post('/chat', payload);
        return response.data;

    } catch (error) {
        console.log('Chat API Error:', error);

        let errorMessage = 'Failed to send chat message';
        const errorData = error.response?.data;

        // Extract error message from different response formats
        if (errorData?.detail) {
            errorMessage = Array.isArray(errorData.detail)
                ? errorData.detail.map(e => e.msg).join(', ')
                : errorData.detail;
        } else if (error.message) {
            errorMessage = error.message;
        }

        ShowCustomToast(errorMessage, 'error');
        return null;
    }
};

export const createSearchContextandSource = async (data) => {
    try {
        const response = await axiosInstance.post('/search-context', data);
        return response.data;
    } catch (error) {
        console.log('Error creating search context:', error);
        return { error: "Failed to create search context" };
    }
};

export const listConversations = async (user_id) => {
    try {
        const response = await axiosInstance.post('/list-conversations', { user_id });
        
        // Handle both array and object response formats
        if (Array.isArray(response.data)) {
            return {
                conversations: response.data.map(conv => ({
                    conversation_id: conv.conversation_id,
                    title: conv.title || `Conversation ${conv.conversation_id.slice(-4)}`
                }))
            };
        } else if (response.data?.data) {
            // Handle nested data property
            return {
                conversations: Array.isArray(response.data.data) 
                    ? response.data.data.map(conv => ({
                        conversation_id: conv.conversation_id,
                        title: conv.title || conv.conversation_title || `Conversation ${conv.conversation_id.slice(-4)}`
                    }))
                    : []
            };
        }
        
        return { conversations: [] };
    } catch (error) {
        console.log('Error fetching conversations:', error);
        return { conversations: [] };
    }
};


export const fetchConversation = async (conversationId) => {
  try {
    const response = await axiosInstance.post('/fetch-conversation', {
      conversation_id: conversationId,
    });
    return response.data;
  } catch (error) {
    console.log('Error fetching conversation:', error);
    return { error: 'Failed to fetch conversation' };
  }
};

export const optimizePrompt = async (prompt) => {
    try {
        const response = await axiosInstance.post('/optimize-prompt', { prompt });
        return response.data;
    } catch (error) {
        console.log('Error optimizing prompt:', error);
        return { error: "Failed to optimize prompt" };
    }
};