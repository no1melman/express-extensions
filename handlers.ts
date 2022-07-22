import express from 'express';

import { ApplicationError, Result } from '../types';

const handleResponse = <TOk>(
  result: Result<TOk, ApplicationError>,
  response: express.Response,
): void => {
  result.match<void>(
    // tried just collapsing this into response.json... but it didn't work, so having it like this avoids that issue
    data => response.json({ success: true, ...data }),
    // these are split up so that errorType doesn't appear on the output, that's just Typescript DUs garbage
    ({ errorType, ...errorObj }) => {
      (errorType === 'ValidationError'
        ? response.status(400)
        : errorType === 'PartialError'
        ? response.status(206) // partial content
        : response.status(500)
      ).json({ success: false, ...errorObj });
    },
  );
};

export const executeHandler =
  <TOk>(
    handlerFn: (
      request: express.Request,
    ) => Promise<Result<TOk, ApplicationError>>,
  ) =>
  async (request: express.Request, response: express.Response) => {
    handleResponse(await handlerFn(request), response);
  };
