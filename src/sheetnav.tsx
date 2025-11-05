import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { WindowSizeProvider } from '@/contexts/WindowSizeContext';


const importToolSheetNav = (tool: string) => {
    return lazy(() => 
        import(`@plugins/${tool}-ui/navigation/${tool}_sheetnav.tsx`)
            .catch(() => {
                // Return a simple component if import fails
                return {
                    default: () => null
                };
            })
    );
};

interface SheetNavProps {
    portfolio: string;
    org: string;
    tool: string;
    section: string;
}

export default function SheetNav({portfolio, org, tool, section}: SheetNavProps) {   
    
    const navigate = useNavigate();

    if (!tool) {
        return null;
    }

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    // Dynamically load the tool component
    const ToolSheetNavComponent = importToolSheetNav(tool);
       
    return (
        <div className="contents">
            <Suspense fallback={<div></div>}>
                <WindowSizeProvider>
                    <ToolSheetNavComponent 
                        portfolio={portfolio} 
                        org={org} 
                        tool={tool} 
                        section={section} 
                        onNavigate={handleNavigation}
                    />
                </WindowSizeProvider>
            </Suspense>
        </div>
    );
}