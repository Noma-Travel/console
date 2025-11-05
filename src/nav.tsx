import { lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';

const importToolNav = (tool: string) => {
    // Use relative path from the current directory
    return lazy(() => 
      import(`@plugins/${tool}-ui/navigation/${tool}_sidenav.tsx`)
          .catch((error) => {
              console.log(`${tool} :E `, error);
              // Return a simple component if import fails
              return {
                  default: () => null
              };
          })
      );
};

interface SideNavProps {
    portfolio: string;
    org: string;
    tool?: string;
    section?: string;
}

export default function SideNav({portfolio, org, tool, section}: SideNavProps) {  
    
    const navigate = useNavigate();
    
    if (!tool) {
        return null;
    }

    console.log('Tools')

    const handleNavigation = (path: string) => {
        navigate(path);
      };

    // Dynamically load the tool component
    const ToolNavComponent = importToolNav(tool);
       
    return (
        <Suspense fallback={<div></div>}>          
                <ToolNavComponent 
                    portfolio={portfolio} 
                    org={org}
                    tool={tool}
                    section={section}
                    onNavigate={handleNavigation}
                /> 
        </Suspense>
    );
}