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
            strokeColor: PropTypes.string,
            strokeWidth: PropTypes.number,
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
            strokeColor: "red",
            strokeWidth: 3,
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
            paths: [],
            currentPath: null
        };

        this.gesture = Gesture.Pan()
            .maxPointers(1)
            .averageTouches(true)
            .onBegin(e => {
                this.setState({
                    currentPath: {
                        points: `${e.absoluteX},${e.absoluteY}`,
                        color: this.props.strokeColor,
                        width: this.props.strokeWidth
                    }
                });
            })
            .onChange(e => {
                this.setState(prevState => ({
                    currentPath: {
                        ...prevState.currentPath,
                        points: `${prevState.currentPath.points} ${e.absoluteX},${e.absoluteY}`
                    }
                }));
            })
            .onEnd(e => {
                this.setState(prevState => ({
                    paths: [...prevState.paths, prevState.currentPath],
                    currentPath: {
                            points: `${e.absoluteX},${e.absoluteY}`,
                        color: this.props.strokeColor,
                        width: this.props.strokeWidth
                    }
                }));
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
                    strokeWidth={path.width}
                />
            );
        });
    }

    _renderCurrentPath() {
        if (!this.state.currentPath) return;
        return (
            <Polyline
                key={this.state.currentPath.points}
                points={this.state.currentPath.points}
                fill="none"
                stroke={this.state.currentPath.color || this.props.strokeColor}
                strokeWidth={this.state.currentPath.width}
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
