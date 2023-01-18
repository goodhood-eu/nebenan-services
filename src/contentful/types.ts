type ContentfulSpaceDefaults = {
  id: string | number;
  token: string;
  preview_token?: string;
};
// TODO: clean up exports

export type FormattedImage = { id: string, url: string };

export type ContentfulSpace = (
  ContentfulSpaceDefaults & (
    Record<`content_type_${string}`, string>
  )
);

export type ContentfulRequestQuery = {
  preview?: boolean,
  query_string: string,
};

export type GetQueryRequestReturnValue = undefined | {
  query?: ContentfulRequestQuery,
  url?: string,
  graceful?: true,
};

export type ContentfulSysAttributes = {
  id: string,
  type: string,
};

export type ContentfulEntity = {
  sys: ContentfulSysAttributes & {
    linkType?: string,
  }
};

export type ContentfulAssetObject = {
  metadata?: {
    tags: string[],
  },
  sys: {
    space: ContentfulEntity,
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    revision: number;
    locale: string;
    environment?: ContentfulEntity
  },
  fields: Record<string, unknown> & {
    file?: {
      url: string;
      details: {
        size: number;
        image: {
          width: number;
          height: number;
        },
      },
      fileName: string;
      contentType: string;
    }
  }
};

export type ContentfulResponseObject = {
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
    sys: ContentfulSysAttributes & {
      space: ContentfulEntity,
      contentType: ContentfulEntity,
      revision: number;
      createdAt: string;
      updatedAt: string;
      environment: ContentfulEntity,
      locale: string;
    },
    fields: Record<string, unknown>
  }[],
  errors?: {
    sys: ContentfulSysAttributes,
    details: {
      type: string,
      linkType: string,
      id: string,
    }
  }[],
  includes: {
    Asset: ContentfulAssetObject[]
  }
};

export type ScaffoldingData = {
  images_list: ContentfulEntity[];
  assets: Record<string, ContentfulAssetObject>;
  responseWithErrors: ContentfulResponseObject;
  validResponse: ContentfulResponseObject;
};
