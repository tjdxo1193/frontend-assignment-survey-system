import { setupWorker } from 'msw/browser';
import { surveyHandlers } from './handlers/survey.handlers';
import { sessionHandlers } from './handlers/session.handlers';

export const worker = setupWorker(...surveyHandlers, ...sessionHandlers);
