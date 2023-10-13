import AbstractProvider, {
  EndpointArgument,
  ParseArgument,
  ProviderOptions,
  SearchResult,
  SearchArgument,
  RequestType,
} from './provider';

export interface RequestResult {
  features: RawResult[];
  type: string;
  version: string;
  attribution: string;
  licence: string;
  query: string;
  limit: string;
}

export interface RawResult {
  properties: {
    label: string;
    score: number;
    importance: number;
    x: number;
    y: number;
    housenumber: string;
    id: string;
    type: string;
    name: string;
    postcode: string;
    citycode: string;
    city: string;
    context: string;
    street: string;
  };
  type: string;
  geometry: {
    coordinates: number[];
    type: string;
  };
}

export type GeoApiFrProviderOptions = {
  searchUrl?: string;
  reverseUrl?: string;
} & ProviderOptions;

export default class GeoApiFrProvider extends AbstractProvider<
  RequestResult,
  RawResult
> {
  searchUrl: string;
  reverseUrl: string;

  constructor(options: GeoApiFrProviderOptions = {}) {
    super(options);

    const host = 'https://api-adresse.data.gouv.fr';
    this.searchUrl = options.searchUrl || `${host}/search`;
    this.reverseUrl = options.reverseUrl || `${host}/reverse`;
  }

  endpoint({ query, type }: EndpointArgument) {
    const params = typeof query === 'string' ? { q: query } : query;

    switch (type) {
      case RequestType.REVERSE:
        return this.getUrl(this.reverseUrl, params);

      default:
        return this.getUrl(this.searchUrl, params);
    }
  }

  parse(result: ParseArgument<RequestResult>): SearchResult<RawResult>[] {
    return result.data.features.map((r) => ({
      x: r.geometry.coordinates[0],
      y: r.geometry.coordinates[1],
      label: r.properties.label,
      bounds: null,
      raw: r,
    }));
  }

  async search(options: SearchArgument): Promise<SearchResult<RawResult>[]> {
    // GeoApiFr returns a 400 error when query length < 2 or query length > 200
    if (options.query.length < 3) {
      return [];
    } else if (options.query.length > 200) {
      options.query = options.query.substring(0, 200);
    }

    return super.search(options);
  }
}
