import React, {useState, useEffect} from 'react';
import { useHistory } from "react-router-dom";

// MATERIAL UI
import { makeStyles, withStyles, useTheme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Fab from '@material-ui/core/Fab';
import FavoriteIcon from '@material-ui/icons/Favorite';
import CrossIcon from '@material-ui/icons/Clear';
import StarIcon from '@material-ui/icons/Star';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Modal from '@material-ui/core/Modal';
import { Button } from '@material-ui/core';
import Slider from '@material-ui/core/Slider';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';

function Client(props) {
    // STYLED

    const useStyles = makeStyles(theme =>({
        card: {
            width: 400
        },
        media: {
            height: 500,
        },
        root: {
            '& > *': {
              margin: theme.spacing(1),
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        extendedIcon: {
            marginRight: theme.spacing(1),
        },
        formControl: {
            display: 'flex',
            margin: theme.spacing(1),
            minWidth: 120,
        },
        chips: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        chip: {
            margin: 2,
        },
        paper: {
            display : 'flex',
        },
        container: {
            display : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'scroll',
          },
        modalContent: {
            padding: 30,
            outline: 'none',
            position: 'absolute',
            width: '70%',
            justifyContent: 'center',
            backgroundColor: theme.palette.background.paper,
        },
        modalContentTextSpan: {
            color: "Gray"
        },
        sliderPrice: {
            width: '70%' + theme.spacing(3) * 2,
        },
        sliderPriceMargin: {
            height: theme.spacing(3),
        },
        rateIcon: {
            position: 'absolute'     
        },
        iconDiv : {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 75,
            height: 75,
            position: 'relative',
            top: 225,
            left: 160,
        }
    }))

    const classes = useStyles();
    const theme = useTheme();

    // STATE, EFFECT
    const [imageSrc, setImageSrc] = useState('')
    const [imageList, setImageList] = useState([])
    const [typeCloth, setTypeCloth] = useState('')
    const [materialCloth, setMaterialCloth] = useState('')
    const [productionMethod, setProductionMethod] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [open, setOpen] = React.useState(false);
    const [noMoreCloth, setNoMoreCloth] = useState(false)
    const [filtersObj, setFiltersObj] = useState({
        clothe_sex: [],
        clothe_type: [],
        clothe_material: [],
        clothe_production: [],
        clothe_price_range: [0, 999],
    })

    const [popoverValue, setPopoverValue] = useState('empty');
    const [checkedIcon, setCheckedIcon] = useState(false);

    const token = localStorage.usertoken
    const history = useHistory();

    useEffect(() => {
        if(!token){
            history.push("/")
        } else {
            getListImages();
        }
    }, [token, history]);

    const sexList= [
        'M',
        'F',
    ];

    const typeList= [
        "jeans",
        "sweater",
        "dress",
    ];

    const materialList= [
        "cotton",
        "wool",
        "synthetic",
        "silk",
    ];
    
    const productionList= [
        "local",
        "made in bangladesh",
        "sustainable",
        "industrial",
    ];

    let sliderValue = [0,999]
    
    // FUNCTIONS
    
    const getStyles = (name, personName, theme) => {
        return {
            fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
        };
    }

    const getListImages = async (update = false) => {
        const options = {
            method: 'POST',
            body: JSON.stringify(imageList),
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/load_image_for_rating`, options)
        .then((response) => {
            response.json().then(function (listImageFromBackend) {
                if ("msg" in listImageFromBackend) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push("/")
                    return;
                }
                if ("no_more_pictures" in listImageFromBackend){
                    props.setTokenState(token)
                    if (update === 'filters') {
                        setImageList([])
                        setImageSrc('')
                    } else {
                        let iL = imageList
                        iL.shift()                    
                        setFiltersObj(listImageFromBackend['filters'])
                        if (iL.length > 0 ) {
                            setImageList(iL)
                            showImage(iL[0])
                        } else {
                            setImageSrc('')
                        }
                    }
                    setNoMoreCloth(true)
                    return;
                }
                if (update === 'rate') {
                    setFiltersObj(listImageFromBackend['filters'])
                    props.setTokenState(token)
                    let iL = imageList.concat(listImageFromBackend['imgs'])
                    iL.shift()
                    setImageList(iL)
                    showImage(iL[0])
                } else {
                    setFiltersObj(listImageFromBackend['filters'])
                    props.setTokenState(token)
                    setImageList(listImageFromBackend['imgs'])
                    showImage(listImageFromBackend['imgs'][0])
                }
            });
        })
    };

    const showImage = async (imageInfo) => {
        setTypeCloth(imageInfo["typeCloth"])
        setMaterialCloth(imageInfo["materialCloth"])
        setProductionMethod(imageInfo["productionMethod"])
        setPrice(imageInfo["price"])
        setDescription(imageInfo["description"])

        const options = {
            method: 'POST',
            body: JSON.stringify({ imageName: imageInfo["name"] }),
        };
        fetch(`http://127.0.0.1:5000/show_image`, options)
        .then((response) => {
            response.blob().then(function (imageUrl) { 
                var urlCreator = window.URL || window.webkitURL;
                imageUrl = urlCreator.createObjectURL(imageUrl);
                setImageSrc(imageUrl);
            });
        })
    }

    const rateImage = (value) => {
        setPopoverValue(value)
        handleChangeIcon()
        try {
            const options = {
                method: 'POST',
                body: JSON.stringify({ imageName: imageList[0]["name"], rating: value }),
                headers: {
                    'Accept': 'application/json',
                    'Authorization': token
                }
            };
            fetch(`http://127.0.0.1:5000/rate_image`, options)
            .then((response) => {
                response.json().then(function(resText) {
                    if ("msg" in resText) {
                        props.setTokenState('')
                        localStorage.removeItem('usertoken')
                        history.push("/")
                    return;
                } else if ("valid" in resText)
                    console.log(resText["valid"]);   
                });
            })
            let iL = imageList
            if (iL.length === 0 && noMoreCloth) {
                setImageSrc('')
            } else if (iL.length === 0) {
                console.log("Loading new images...")
            } else if (iL.length < 7) {
                getListImages('rate')
            } else {
                iL.shift()
                showImage(iL[0])
                setImageList(iL)
            }
        } catch (err) {
            console.log("Loading images ...");
        }
    }

    const updateFilters = async () => {
        const options = {
            method: 'POST',
            body: JSON.stringify(filtersObj),
            headers: {
                'Accept': 'application/json',
                'Authorization': token
            }
        };
        fetch(`http://127.0.0.1:5000/update_filters`, options)
        .then((response) => {
            response.json().then(function (res) {
                if ("msg" in res) {
                    props.setTokenState('')
                    localStorage.removeItem('usertoken')
                    history.push("/")
                    return;
                }
                if ("valid" in res) {
                    getListImages('filters')
                }
            });
        })
    };

    const handleOpen = () => {
        setOpen(true);
    };
    
    const handleClose = () => {
        updateFilters()
        setOpen(false);
    };

    const handleChangeIcon = () => {
        setCheckedIcon(true);
        setTimeout(
            function() {
                setCheckedIcon(false);
            },
            500
        );
      };

    const AirbnbSlider = withStyles({
        root: {
            color: '#3a8589',
            height: 3,
            padding: '13px 0',
        },
        thumb: {
            height: 27,
            width: 27,
            backgroundColor: '#fff',
            border: '1px solid currentColor',
            marginTop: -12,
            marginLeft: -13,
            boxShadow: '#ebebeb 0px 2px 2px',
            '& .bar': {
                height: 9,
                width: 1,
                backgroundColor: 'currentColor',
                marginLeft: 1,
                marginRight: 1,
            },
        },
        active: {},
        valueLabel: {
            left: 'calc(-50% + 4px)',
        },
        track: {
          height: 3,
        },
        rail: {
            color: '#d8d8d8',
            opacity: 1,
            height: 3,
        },
    })(Slider);
    
    return (
        <Container className={classes.container} component="main" maxWidth="xl">
            <div className={classes.Button}>
                {
                    imageSrc ?
                    <>
                    <Card className={classes.card}>
                        {
                            popoverValue === 0 ?
                                <Fade 
                                    in={checkedIcon}
                                >
                                    <div className={classes.rateIcon}>
                                        <div className={classes.iconDiv}>
                                            <CrossIcon style={{ color: 'white', height: 50, width: 50 }} />
                                        </div>
                                    </div>
                                </Fade>
                            : 
                                popoverValue === 1 ?
                                    <Fade 
                                        in={checkedIcon}
                                    >
                                        <div className={classes.rateIcon}>
                                            <div className={classes.iconDiv}>
                                                <FavoriteIcon color="secondary" style={{ height: 50, width: 50 }} /> 
                                            </div>
                                        </div>
                                    </Fade>
                                :
                                    popoverValue === 2 ?
                                        <Fade 
                                            in={checkedIcon}
                                        >
                                            <div className={classes.rateIcon}>
                                                <div className={classes.iconDiv}>
                                                    <StarIcon color="primary" style={{ height: 50, width: 50 }} />
                                                </div>
                                            </div> 
                                        </Fade>
                                    :
                                        <div></div>
                        }
                        <CardMedia
                            className={classes.media}
                            image={imageSrc}
                        />
                        <CardContent>
                            <Typography component="p">
                                <span className={classes.modalContentTextSpan}>Type of cloth:</span> {typeCloth}
                            </Typography>
                            <Typography component="p">
                                <span className={classes.modalContentTextSpan}>Cloth material:</span> {materialCloth}
                            </Typography>
                            <Typography component="p">
                                <span className={classes.modalContentTextSpan}>Production method:</span> {productionMethod}
                            </Typography>
                            <Typography component="p">
                                <span className={classes.modalContentTextSpan}>Price:</span> {price}
                            </Typography>
                            <Typography component="p">
                                <span className={classes.modalContentTextSpan}>Description:</span> {description}
                            </Typography>
                        </CardContent>
                    </Card> 
                        <div className={classes.root}>
                            <Fab onClick={() => rateImage(0)} aria-label="dislike" title="Dislike">
                                <CrossIcon style={{ color: 'white' }} />
                            </Fab>
                            <Fab onClick={() => rateImage(2)} color="primary" aria-label="superLike" title="Super like">
                                <StarIcon />
                            </Fab>
                            <Fab onClick={() => rateImage(1)} color="secondary" aria-label="like" title="Like">
                                <FavoriteIcon />
                            </Fab>
                        </div>
                    </>
                    :
                    <div>
                        {noMoreCloth ? <Typography variant="subtitle1" align="center" color="textSecondary" component="p">'No more clothes for now. Try again later or change your filters.'</Typography> : <CircularProgress />}
                    </div>
                }
                <Button onClick={handleOpen}>
                    Filters
                </Button>
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                className={classes.modal}
            >
                <div className={classes.modalContent}>
                    <Typography variant="h4" align="center" color="secondary" component="h4">Filters</Typography>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Sex</InputLabel>
                        <Select
                            multiple
                            value={filtersObj['clothe_sex']}
                            onChange={e => setFiltersObj({...filtersObj, clothe_sex: e.target.value})}
                            input={<Input />}
                            renderValue={selected => (
                                <div className={classes.chips}>
                                    {
                                        selected.map(value => (
                                            <Chip key={value} label={value} className={classes.chip} />
                                        ))
                                    }
                                </div>
                            )}
                        >
                        {sexList.map(sexItems => (
                            <MenuItem key={sexItems} value={sexItems} style={getStyles(sexItems, filtersObj['clothe_sex'], theme)}>
                                {sexItems}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <br/>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Cloth type</InputLabel>
                        <Select
                            multiple
                            value={filtersObj['clothe_type']}
                            onChange={e => setFiltersObj({...filtersObj, clothe_type: e.target.value})}
                            input={<Input />}
                            renderValue={selected => (
                                <div className={classes.chips}>
                                    {
                                        selected.map(value => (
                                            <Chip key={value} label={value} className={classes.chip} />
                                        ))
                                    }
                                </div>
                            )}
                        >
                        {typeList.map(typeItems => (
                            <MenuItem key={typeItems} value={typeItems} style={getStyles(typeItems, filtersObj['clothe_type'], theme)}>
                                {typeItems}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <br/>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Cloth material</InputLabel>
                        <Select
                            multiple
                            value={filtersObj['clothe_material']}
                            onChange={e => setFiltersObj({...filtersObj, clothe_material: e.target.value})}
                            input={<Input />}
                            renderValue={selected => (
                                <div className={classes.chips}>
                                    {
                                        selected.map(value => (
                                            <Chip key={value} label={value} className={classes.chip} />
                                        ))
                                    }
                                </div>
                            )}
                        >
                        {materialList.map(materialItems => (
                            <MenuItem key={materialItems} value={materialItems} style={getStyles(materialItems, filtersObj['clothe_material'], theme)}>
                                {materialItems}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <br/>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Cloth production</InputLabel>
                        <Select
                            multiple
                            value={filtersObj['clothe_production']}
                            onChange={e => setFiltersObj({...filtersObj, clothe_production: e.target.value})}
                            input={<Input />}
                            renderValue={selected => (
                                <div className={classes.chips}>
                                    {
                                        selected.map(value => (
                                            <Chip key={value} label={value} className={classes.chip} />
                                        ))
                                    }
                                </div>
                            )}
                        >
                        {productionList.map(productionItems => (
                            <MenuItem key={productionItems} value={productionItems} style={getStyles(productionItems, filtersObj['clothe_production'], theme)}>
                                {productionItems}
                            </MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <br/>
                    <div className={classes.sliderPrice}>
                        <div className={classes.sliderPriceMargin} />
                            <Typography color="textSecondary" gutterBottom>Price</Typography>
                            <AirbnbSlider
                                valueLabelDisplay="on"
                                defaultValue={[filtersObj['clothe_price_range'][0], filtersObj['clothe_price_range'][1]]}
                                max={999}
                                min={0}
                                onChange={(event ,value) => {sliderValue = value}}
                                onChangeCommitted={(v) => setFiltersObj({...filtersObj, clothe_price_range: sliderValue})}
                            />
                    </div>
                </div>
            </Modal>
        </Container>
    );
}

export default Client;
