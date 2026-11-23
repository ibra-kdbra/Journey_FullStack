import { v4 as uuidv4 } from "uuid";
import { prepareFeedbackDataColumn } from "../../../../utils/feedback";
import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../../../utils/fetching";
import endpoints from "../endpoints";

export class FeedbackService {
  constructor(private feedbackEndpoints) {}

  async submitFeedback(feedbackData: {
    feedback: string;
    name: string;
  }) {
    try {
      const data = {
        id: uuidv4(),
        fullName: feedbackData.name,
        feedback: prepareFeedbackDataColumn(feedbackData.feedback),
      };

      await axios.post(this.feedbackEndpoints.SUBMIT, data);
    } catch (err) {
      // AxiosError extends Error, so it must be tested first.
      if (err instanceof AxiosError) handleAxiosError(err);
      else if (err instanceof Error) console.error("Error: ", err.message);
    }
  }
}
