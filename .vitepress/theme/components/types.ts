export interface Plugin {
  name: string;
  scope: string;
  version: string;
  description: string;
  keywords: string[];
  date: string;
  links: PluginLinks;
  author: PluginAuthor;
  publisher: PluginPublisher;
  maintainers: PluginMaintainer[];
  downloadStats: PluginDownloadStats;
}

export interface PluginLinks {
  npm: string;
  homepage: string;
  repository: string;
  bugs: string;
}

export interface PluginAuthor {
  name: string;
  username: string;
}

export interface PluginPublisher {
  username: string;
  email: string;
}

export interface PluginMaintainer {
  username: string;
  email: string;
}

export interface PluginDownloadStats {
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
}

export interface Author {
  name: string;
  username: string;
  plugins: Plugin[];
}
