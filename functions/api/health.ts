import { ok } from '../_shared/helpers';

export const onRequestGet: PagesFunction = async () => {
  return ok({ status: 'ok', runtime: 'cloudflare-pages' });
};
