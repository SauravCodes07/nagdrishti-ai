
import { Link } from 'react-router';
import nagdrishtiLogo from '@/assets/images/logos/nagdrishti-logo.png';
import { SidebarMenuButton } from 'src/components/ui/sidebar';

const Logo = () => {
    return (
        <Link to={'/'}>
            <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center justify-center p-1"
            >
                <img src={nagdrishtiLogo} alt="NagDrishti AI" className="h-8 w-auto object-contain" />
            </SidebarMenuButton>
        </Link>
    );
};

export default Logo;
