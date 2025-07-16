interface FeedbackData {
    messageId: number;
    isHelpful: boolean;
    timestamp: Date;
    language: string;
}

interface AnalyticsData {
    totalMessages: number;
    helpfulResponses: number;
    unhelpfulResponses: number;
    mostUsedLanguage: string;
    averageResponseTime: number;
}

class AnalyticsService {
    private static instance: AnalyticsService;
    private feedbackData: FeedbackData[] = [];
    private analyticsData: AnalyticsData = {
        totalMessages: 0,
        helpfulResponses: 0,
        unhelpfulResponses: 0,
        mostUsedLanguage: 'en',
        averageResponseTime: 0,
    };

    private constructor() {
        this.loadData();
    }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    private loadData(): void {
        const savedFeedback = localStorage.getItem('feedbackData');
        const savedAnalytics = localStorage.getItem('analyticsData');
        if (savedFeedback) {
            this.feedbackData = JSON.parse(savedFeedback);
        }
        if (savedAnalytics) {
            this.analyticsData = JSON.parse(savedAnalytics);
        }
    }

    private saveData(): void {
        localStorage.setItem('feedbackData', JSON.stringify(this.feedbackData));
        localStorage.setItem(
            'analyticsData',
            JSON.stringify(this.analyticsData)
        );
    }

    public recordFeedback(feedback: FeedbackData): void {
        this.feedbackData.push(feedback);
        if (feedback.isHelpful) {
            this.analyticsData.helpfulResponses++;
        } else {
            this.analyticsData.unhelpfulResponses++;
        }
        this.saveData();
    }

    public recordMessage(language: string, responseTime: number): void {
        this.analyticsData.totalMessages++;
        this.analyticsData.mostUsedLanguage = language;
        this.analyticsData.averageResponseTime =
            (this.analyticsData.averageResponseTime *
                (this.analyticsData.totalMessages - 1) +
                responseTime) /
            this.analyticsData.totalMessages;
        this.saveData();
    }

    public getAnalytics(): AnalyticsData {
        return this.analyticsData;
    }

    public getFeedbackData(): FeedbackData[] {
        return this.feedbackData;
    }

    public clearData(): void {
        this.feedbackData = [];
        this.analyticsData = {
            totalMessages: 0,
            helpfulResponses: 0,
            unhelpfulResponses: 0,
            mostUsedLanguage: 'en',
            averageResponseTime: 0,
        };
        this.saveData();
    }
}

export default AnalyticsService;
