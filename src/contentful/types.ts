export type TNebenanLocales = 'de-DE' | 'de' | 'en-US' | 'en' | 'fr-FR' | 'fr' | 'es-ES' | 'es' | 'it-IT' | 'it';

export type TContentfulSpaceDefaults = {
  id: string;
  token: string;
  preview_token: string;
};

export type TContentfulSpace<T extends string | void = void> = T extends void
  ? TContentfulSpaceDefaults
  : TContentfulSpaceDefaults & Partial<{
    [key: `content_type_${T}` | string]: string;
  }>;

export type TContentfulSysAttributes = {
  id: string,
  type: string,
};

export type TContentfulEntity = {
  sys: TContentfulSysAttributes & {
    linkType?: string,
  }
};

export type TContentfulAssetObject = {
  metadata?: {
    tags: string[],
  },
  sys: {
    space: TContentfulEntity,
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
    locale: TNebenanLocales;
    environment?: TContentfulEntity
  },
  fields: Record<string, unknown>
};

export type TContentfuleResponseObject = {
  sys: {
    type: string
  },
  total: number;
  skip: number;
  limit: number;
  items: {
    metadata: {
      tags: string[],
    },
    sys: TContentfulSysAttributes & {
      space: TContentfulEntity,
      contentType: TContentfulEntity,
      revision: number;
      createdAt: string;
      updatedAt: string;
      environment: TContentfulEntity,
      locale: TNebenanLocales;
    },
    fields: Record<string, unknown>
  }[],
  errors?: {
    sys: TContentfulSysAttributes,
    details: {
      type: string,
      linkType: string,
      id: string,
    }
  }[],
  includes: {
    Asset: TContentfulAssetObject[]
  }
};

export type TScaffoldingData = {
  images_list?: TContentfulEntity[];
  assets?: Record<string, TContentfulAssetObject>;
  responseWithErrors?: TContentfuleResponseObject;
  validResponse?: TContentfuleResponseObject;
};
