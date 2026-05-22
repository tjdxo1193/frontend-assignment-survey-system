/**
 * Survey-related type definitions based on API spec
 */

export interface QuestionOption {
	id: string;
	label: string;
	nextQuestionId?: string;
}

export type QuestionType = "singleChoice" | "multiChoice" | "text";

export interface ConditionalNextWhen {
	anySelectedIn: {
		questionId: string;
		optionIds: string[];
	};
}

export interface ConditionalNext {
	when?: ConditionalNextWhen;
	default?: boolean;
	go: string;
}

export interface Question {
	id: string;
	type: QuestionType;
	text: string;
	options?: QuestionOption[];
	required: boolean;
	nextQuestionId?: string | null;
	next?: ConditionalNext[];
	minSelect?: number;
	maxSelect?: number;
}

export interface Survey {
	id: string;
	title: string;
	version: number;
	startQuestionId: string;
	questions: Question[];
}

/**
 * API Response DTOs
 */

export interface SurveyResponseDto {
	id: string;
	title: string;
	version: number;
	startQuestionId: string;
	questions: Question[];
}

export interface QuestionResponseDto {
	id: string;
	type: QuestionType;
	text: string;
	options?: QuestionOption[];
	required: boolean;
	nextQuestionId?: string | null;
	minSelect?: number;
	maxSelect?: number;
}
