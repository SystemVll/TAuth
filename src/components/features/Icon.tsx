import { Component } from 'react';

type Props = {
    type:
        | 'solid'
        | 'regular'
        | 'sharp'
        | 'light'
        | 'brands'
        | 'thin'
        | 'duotone';
    icon: string;
    size?: string;
    flip?: 'horizontal' | 'vertical';
    rotate?: 90 | 180 | 270;
    className?: string;
};

export default class Icon extends Component<Props> {
    render(): React.ReactNode {
        const type: string = 'fa-' + this.props.type + ' ';
        const icon: string = 'fa-' + this.props.icon;
        const size: string = this.props.size
            ? ' ' + 'fa-' + this.props.size
            : '';
        const flip: string = this.props.flip
            ? ' ' + 'fa-flip-' + this.props.flip
            : '';
        const rotate: string = this.props.rotate
            ? ' ' + 'fa-rotate-' + this.props.rotate
            : '';

        const className: string = this.props.className
            ? ' ' + this.props.className
            : '';

        return (
            <i className={type + icon + size + flip + rotate + className}></i>
        );
    }
}
