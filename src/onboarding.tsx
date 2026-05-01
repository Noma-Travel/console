import { lazy, Suspense, useContext } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalContext } from "@/components/console/global-context";

const importOnboarding = (plugin: string) => {
  return lazy(() =>
    import(`@extensions/${plugin}/ui/onboarding/${plugin}_onboarding.tsx`).catch(() => {
      console.log(`${plugin} : Extension not found`);
      return {
        default: () => null,
      };
    })
  );
};

const FallbackCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Loading extension...</CardTitle>
      <CardDescription>Preparing install card</CardDescription>
    </CardHeader>
  </Card>
);

export default function Onboarding() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("No GlobalProvider");
  }
  const { tree } = context;

  const bootstrapPluginsEnv = import.meta.env.VITE_EXTENSIONS || import.meta.env.VITE_BOOTSTRAP_PLUGINS || "";
  const bootstrapPlugins = bootstrapPluginsEnv
    .split(",")
    .map((plugin: string) => plugin.trim())
    .filter(Boolean);

  const bootstrapComponents: React.ComponentType<{ tree: any }>[] = [];
  for (const bootstrapPlugin of bootstrapPlugins) {
    const OnboardingComponent = importOnboarding(bootstrapPlugin);
    bootstrapComponents.push(OnboardingComponent);
  }

  if (!bootstrapComponents.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No extensions configured</CardTitle>
          <CardDescription>
            Add extension handles to <code>VITE_EXTENSIONS</code> to populate the marketplace.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <main className="mx-auto w-full max-w-7xl px-1 py-2 sm:px-2 sm:py-4">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Extensions</h1>
            <p className="mt-1 text-muted-foreground">
              Discover and install extensions to your portfolio, like apps for your company.
            </p>
          </div>
          <Badge variant="secondary">{bootstrapComponents.length} available</Badge>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Available Extensions</h2>
            <p className="text-sm text-muted-foreground">Each extension includes its own setup card.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {bootstrapComponents.map((OnboardingComponent, index) => (
              <Suspense key={index} fallback={<FallbackCard />}>
                <OnboardingComponent tree={tree} />
              </Suspense>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}