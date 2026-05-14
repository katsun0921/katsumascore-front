/** person / company CPT の正規化済みエンティティ型。 */

export type PersonRole = 'actor' | 'director';
export type CompanyRole = 'production' | 'distributor';

export type Person = {
  id: string;
  slug: string;
  name: string;
  roles: PersonRole[];
  bio?: string;
  image?: string | null;
  lang?: 'ja' | 'en';
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  roles: CompanyRole[];
  description?: string;
  logo?: string | null;
  lang?: 'ja' | 'en';
};
