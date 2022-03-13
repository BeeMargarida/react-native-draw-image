import React, { PureComponent } from "react";
import { Dimensions, Image, StyleSheet, View, ViewPropTypes } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { captureRef } from "react-native-view-shot";
import { Polyline, Svg } from "react-native-svg";
import PropTypes from "prop-types";

export class Draw extends PureComponent {
    static get propTypes() {
        return {
            uri: PropTypes.string,
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
            backdrop: undefined,
            strokeColor: "red",
            strokeWidth: 3,
            exportFormat: "png",
            exportQuality: 1,
            onImageError: undefined,
            style: {},
            styles: styles
        };
    }

    constructor(props) {
        super(props);

        const { height, width } = Dimensions.get("window");

        this.state = {
            paths: [],
            currentPath: null,
            backdropDimensions: null,
            aspectRatio: null,
            isLandscape: width >= height
        };

        this.gesture = Gesture.Pan()
            .maxPointers(1)
            .averageTouches(true)
            .onBegin(e => {
                this.setState({
                    currentPath: {
                        points: `${e.x},${e.y}`,
                        color: this.props.strokeColor,
                        width: this.props.strokeWidth
                    }
                });
            })
            .onChange(e => {
                this.setState(prevState => ({
                    currentPath: {
                        ...prevState.currentPath,
                        points: `${prevState.currentPath.points} ${e.x},${e.y}`
                    }
                }));
            })
            .onEnd(e => {
                this.setState(prevState => ({
                    paths: [...prevState.paths, prevState.currentPath],
                    currentPath: {
                        points: `${e.x},${e.y}`,
                        color: this.props.strokeColor,
                        width: this.props.strokeWidth
                    }
                }));
            });

        Dimensions.addEventListener("change", () => this.onOrientationChange());
    }

    componentDidMount() {
        if (!this.props.uri) return;
        Image.getSize(this.props.uri, (width, height) => {
            this.setState({
                aspectRatio: width / height
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

    undo() {
        if (this.state.paths.length === 0) return;

        this.setState(prevState => ({
            paths: prevState.paths.slice(0, -1)
        }));
    }

    onBackdropLayout(e) {
        this.setState({
            backdropDimensions: {
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height
            }
        });
    }

    onOrientationChange() {
        const { height, width } = Dimensions.get("window");
        this.setState({
            isLandscape: width >= height
        });
    }

    _viewBox() {
        if (!this.state.backdropDimensions) return "";
        const { width, height } = this.state.backdropDimensions;

        if (this.state.aspectRatio) {
            return `0 0 ${this.state.isLandscape ? height * this.state.aspectRatio : width} ${
                this.state.isLandscape ? height : width / this.state.aspectRatio
            }`;
        }
        return `0 0 ${width} ${height}`;
    }

    _style() {
        return [styles.draw, this.props.style];
    }

    _rendererStyle() {
        if (!this.state.backdropDimensions) return [styles.renderer];

        const { width, height } = this.state.backdropDimensions;
        return [
            styles.renderer,
            this.state.aspectRatio
                ? {
                      top: this.state.isLandscape
                          ? 0
                          : (height - width / this.state.aspectRatio) / 2,
                      left: this.state.isLandscape
                          ? (width - height * this.state.aspectRatio) / 2
                          : 0,
                      width: this.state.isLandscape ? height * this.state.aspectRatio : width,
                      height: this.state.isLandscape ? height : width / this.state.aspectRatio
                  }
                : {}
        ];
    }

    _renderBackdrop() {
        if (this.props.backdrop)
            return React.cloneElement(this.props.backdrop, {
                style: styles.backdrop
            });
        if (this.props.uri) {
            return (
                <Image
                    style={styles.backdrop}
                    source={{ uri: this.props.uri }}
                    resizeMode={"contain"}
                    onLayout={e => this.onBackdropLayout(e)}
                    onError={this.onLoadingError}
                    {...this.props.imageProps}
                />
            );
        }
        return <View style={styles.backdrop} onLayout={e => this.onBackdropLayout(e)} />;
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
                        <View style={this._rendererStyle()}>
                            <Svg viewBox={this._viewBox()}>
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
    backdrop: {
        flex: 1,
        width: "100%",
        height: "100%"
    },
    gestureHandler: {
        flex: 1
    },
    renderer: {
        flex: 1,
        position: "absolute"
    }
});

export default Draw;
