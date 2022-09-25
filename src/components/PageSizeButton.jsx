import React from 'react';

class PageSizeButton extends React.Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        this.props.onChangePageSize(this.props.pageSize);
    }

    render() {
        const className = this.props.pageSize === this.props.currentPageSize
            ? 'selected'
            : '';

        return (
            <div className="button page-size-button">
                <a onClick={this.onClick} className={className}>{this.props.pageSize}</a>
            </div>
        )
    }
}

export default PageSizeButton;