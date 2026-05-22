import { setupWorker } from 'msw/browser';
import { sessionHandlers } from './handlers/session.handlers';
import { surveyHandlers } from './handlers/survey.handlers';

export const worker = setupWorker(...surveyHandlers, ...sessionHandlers);
