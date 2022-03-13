import React, { PureComponent } from "react";
import { Image, StyleSheet, View, ViewPropTypes } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";
import { Polyline, Svg } from "react-native-svg";
import PropTypes from "prop-types";

export class Draw extends PureComponent {
    static get propTypes() {
        return {
            image: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
            imageProps: PropTypes.object,
            backdrop: PropTypes.object,
            color: PropTypes.string,
            exportFormat: PropTypes.string,
            exportQuality: PropTypes.number,
            onImageError: PropTypes.func,
            style: ViewPropTypes.style,
            styles: PropTypes.any
        };
    }

    static get defaultProps() {
        return {
            image: undefined,
            imageProps: {},
            onImageError: undefined,
            color: "red",
            pathCutInterval: 120,
            exportFormat: "png",
            exportQuality: 1,
            style: {},
            styles: styles
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            rendererDimensions: null,
            lastTimestamp: null,
            paths: [],
            currentPath: null,
            finalImage: null
        };

        this.gesture = Gesture.Pan()
            .averageTouches(true)
            .onChange(e => {
                const isNewPath =
                    this.state.lastTimestamp !== null &&
                    Date.now() - this.state.lastTimestamp > this.props.pathCutInterval;

                this.setState(prevState => {
                    const returnObject = {};

                    if (isNewPath) {
                        const paths = [...prevState.paths, prevState.currentPath];
                        const currentPath = {
                            points: `${e.absoluteX},${e.absoluteY}`,
                            color: this.props.color
                        };

                        returnObject.paths = paths;
                        returnObject.currentPath = currentPath;
                    } else {
                        const currentPath = prevState.currentPath || {
                            points: "",
                            color: this.props.color
                        };
                        currentPath.points += ` ${e.absoluteX},${e.absoluteY}`;

                        returnObject.currentPath = currentPath;
                    }

                    returnObject.lastTimestamp = Date.now();

                    return returnObject;
                });
            });
    }

    async export() {
        return await captureRef(this.root, {
            format: this.props.exportFormat,
            quality: 1,
            result: "base64"
        });
    }

    onLayout(e) {
        this.setState({
            rendererDimensions: {
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height
            }
        });
    }

    _viewBox() {
        if (!this.state.rendererDimensions) return "";
        return `0 0 ${this.state.rendererDimensions.width} ${this.state.rendererDimensions.height}`;
    }

    _style() {
        return [styles.draw, this.props.style];
    }

    _renderBackdrop() {
        if (this.props.backdrop) return React.cloneElement(this.props.backdrop);
        if (this.props.image) {
            return (
                <Image
                    style={styles.image}
                    source={this.props.image}
                    resizeMode={"contain"}
                    onError={this.onLoadingError}
                    {...this.props.imageProps}
                />
            );
        }
        return <View style={styles.image} />;
    }

    _renderPaths() {
        return this.state.paths.map(path => {
            return (
                <Polyline
                    key={path.points}
                    points={path.points}
                    fill="none"
                    stroke={path.color}
                    strokeWidth="3"
                />
            );
        });
    }

    _renderCurrentPath() {
        if (!this.state.currentPath) return;
        console.log(this.state.currentPath.points, this.state.currentPath.color);
        return (
            <Polyline
                key={this.state.currentPath.points}
                points={this.state.currentPath.points}
                fill="none"
                stroke={this.state.currentPath.color || this.props.color}
                strokeWidth="3"
            />
        );
    }

    render() {
        return (
            <GestureHandlerRootView style={this._style()}>
                <View style={{ flex: 1 }} ref={el => (this.root = el)} collapsable={false}>
                    {this._renderBackdrop()}
                    <GestureDetector style={styles.gestureHandler} gesture={this.gesture}>
                        <View style={styles.renderer} onLayout={e => this.onLayout(e)}>
                            <Svg height="100%" width="100%" viewBox={this._viewBox()}>
                                {this._renderPaths()}
                                {this._renderCurrentPath()}
                            </Svg>
                        </View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        );
    }
}

const styles = StyleSheet.create({
    draw: {
        overflow: "hidden",
        flex: 1
    },
    image: {
        position: "absolute",
        zIndex: 5,
        flex: 1,
        width: "100%",
        height: "100%"
    },
    gestureHandler: {
        flex: 1,
        backgroundColor: "green"
    },
    renderer: {
        flex: 1,
        zIndex: 10,
        width: "100%",
        position: "absolute",
        height: "100%"
    }
});

export default Draw;
