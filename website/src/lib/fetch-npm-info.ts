type Package = {
  readme: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  weeklyNPMDownloads: number;
};

const cache: Record<string, Package> = {};

export const fetchNpmInfo = async (packageName: string): Promise<Package> => {
  // cache since we fetch same data on /plugins and /plugins/:category/:name
  const cachedData = cache[packageName];
  if (cachedData) {
    return cachedData;
  }

  const encodedName = encodeURIComponent(packageName);
  const [{ readme, time, description }, { downloads }] = await Promise.all([
    fetch(`https://registry.npmjs.org/${encodedName}`).then(response => response.json()),
    fetch(`https://api.npmjs.org/downloads/point/last-week/${encodedName}`).then(response => response.json()),
  ]);

  cache[packageName] = {
    readme,
    createdAt: time.created,
    updatedAt: time.modified,
    description,
    weeklyNPMDownloads: downloads,
  };

  return cache[packageName];
};
