import { ReactElement, ReactNode } from 'react';
import { Tabs, Tab } from 'nextra-theme-docs/tabs';

const CodeTab = ({ children }: { children: ReactNode }): ReactElement => {
  return (
    <Tab>
      <pre>
        <code data-language="sh" data-theme="default">
          <span
            className="line"
            style={{
              color: 'var(--shiki-color-text)',
            }}
          >
            {children}
          </span>
        </code>
      </pre>
    </Tab>
  );
};

const PACKAGE_MANAGERS = ['yarn', 'npm', 'pnpm'] as const;

type PackageMap = Record<typeof PACKAGE_MANAGERS[number], string>;

const Add: PackageMap = {
  yarn: 'yarn add',
  npm: 'npm install',
  pnpm: 'pnpm add',
};

const Run: PackageMap = {
  yarn: 'yarn',
  npm: 'npm run',
  pnpm: 'pnpm',
};

const Install: PackageMap = {
  yarn: 'yarn install',
  npm: 'npm install',
  pnpm: 'pnpm install',
};

type Command = {
  name: string;
  cmd: 'add' | 'run' | 'install';
  isDev?: boolean;
  isNpx?: boolean;
};

export const PackageCmd = ({ packages }: { packages: (string | Command)[] }) => {
  const pkgs = packages.map(pkg =>
    typeof pkg === 'string'
      ? ({
          name: pkg,
          cmd: 'add',
        } as Command)
      : pkg
  );

  return (
    <Tabs items={PACKAGE_MANAGERS}>
      {PACKAGE_MANAGERS.map(pkgManager => (
        <CodeTab key={pkgManager}>
          {pkgs
            .map(pkg => {
              switch (pkg.cmd) {
                case 'run':
                  return `${pkgManager === 'npm' && pkg.isNpx ? 'npx' : Run[pkgManager]} ${pkg.name}`;
                case 'install':
                  return `${Install[pkgManager]}${pkg.name ? ` ${pkg.name}` : ''}`;
                default:
                  return `${Add[pkgManager]}${pkg.isDev ? ' -D' : ''} ${pkg.name}`;
              }
            })
            .join('\n')}
        </CodeTab>
      ))}
    </Tabs>
  );
};
