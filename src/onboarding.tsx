import { lazy, Suspense, useContext } from 'react';
import { GlobalContext } from "@/components/console/global-context"

const importOnboarding = (plugin: string) => {
    return lazy(() => 
        import(`@extensions/${plugin}/ui/onboarding/${plugin}_onboarding.tsx`)
            .catch(() => {
                console.log(`${plugin} :Not found`)
                return {
                    default: () => null
                };
            })
    );
};

export default function Onboarding() {   
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('No GlobalProvider');
    }
    const { tree } = context;

    // Get bootstrap plugins from environment variable
    const bootstrapPluginsEnv = import.meta.env.VITE_BOOTSTRAP_EXTENSIONS || '';
    const bootstrapPlugins = bootstrapPluginsEnv.split(',').map((plugin: string) => plugin.trim()).filter(Boolean);
    
    const bootstrapComponents: React.ComponentType<{ tree: any }>[] = [];
    
    for (const bootstrapPlugin of bootstrapPlugins) {
        if (!bootstrapPlugin) {
            continue;
        }

        console.log('Bootstraping:',bootstrapPlugin);

        // Dynamically load the onboarding component
        const OnboardingComponent = importOnboarding(bootstrapPlugin);
        bootstrapComponents.push(OnboardingComponent);
    }
            
    return ( 
        <>
            {bootstrapComponents.map((OnboardingComponent, index) => (
                <Suspense key={index} fallback={<div></div>}>
                    <OnboardingComponent tree={tree} />
                </Suspense>    
            ))}
        </>
    )
}