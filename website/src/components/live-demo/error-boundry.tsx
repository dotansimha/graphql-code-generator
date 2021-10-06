import React, {ErrorInfo} from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props: any) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(error, errorInfo);
    }

    render() {
        // @ts-ignore
        if (this.state.hasError) {
            // Fallback
            return <span>Something went wrong.</span>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
