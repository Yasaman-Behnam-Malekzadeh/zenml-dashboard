import axios from 'axios';

import { HUB_API_URL } from '../../../api/constants';
import { memoisePromiseFn } from '../../../utils/memo';

const auth = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

const addCanonicalUrl = (plugin: TPlugin): TPlugin => {
  const { repository_url, repository_branch, repository_subdirectory } = plugin;
  let canonical_url = repository_url;
  if (repository_branch) {
    canonical_url = `${canonical_url}/tree/${repository_branch}`;

    if (repository_subdirectory) {
      canonical_url = `${canonical_url}/${repository_subdirectory}`;
    }
  }

  plugin.canonical_url = canonical_url;
  return plugin;
};

export const getPlugin = async (pluginId: string): Promise<TPlugin> => {
  const plugin = (await axios.get(`${HUB_API_URL}/plugins/${pluginId}`))
    .data as TPlugin;
  return addCanonicalUrl(plugin);
};

export const getPlugins: (
  searchQuery: string,
  filterQueries: string[],
) => Promise<TPlugin[]> = memoisePromiseFn(
  async (searchQuery: string, filterQueries: string[]) => {
    const search = searchQuery ? `&name_contains=${searchQuery}` : '';
    const filter =
      filterQueries.length > 0 ? '&' + filterQueries.join('&') : '';
    const plugins = (
      await axios.get(
        `${HUB_API_URL}/plugins?status=available${search}${filter}`,
      )
    ).data as TPlugin[];
    return plugins.map(addCanonicalUrl);
  },
);

export const getVersions = async (
  pluginName: string,
  userId: TId,
): Promise<TPlugin[]> => {
  return (
    await axios.get(
      `${HUB_API_URL}/plugins?status=available&user_id=${userId}&name=${pluginName}`,
    )
  ).data as TPlugin[];
};

export const getStarredPlugins = async (
  userId: TId,
  token: string,
): Promise<Set<TId>> => {
  const interactions = (
    await axios.get(
      `${HUB_API_URL}/interaction?interaction_type=star&mine=true&user_id=${userId}`,
      auth(token),
    )
  ).data as { plugin_id: string }[];

  return new Set(interactions.map((i) => i.plugin_id));
};

export const getIsStarred = async (
  userId: TId,
  pluginId: TId,
  token: string,
): Promise<boolean> => {
  const interactions = (
    await axios.get(
      `${HUB_API_URL}/interaction?interaction_type=star&mine=true&user_id=${userId}&plugin_id=${pluginId}`,
      auth(token),
    )
  ).data;

  return interactions.length > 0;
};

export const starPlugin = async (
  userId: TId,
  pluginId: TId,
  token: string,
): Promise<void> => {
  return await axios.post(
    `${HUB_API_URL}/interaction`,
    { type: 'star', user_id: userId, plugin_id: pluginId },
    auth(token),
  );
};

export const deletePlugin = async (
  pluginId: TId,
  token: string,
): Promise<void> => {
  return await axios.delete(`${HUB_API_URL}/plugins/${pluginId}`, auth(token));
};
