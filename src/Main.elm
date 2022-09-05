module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Decode as Decode exposing (Error, Value)



-- MAIN


main : Program Value Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , subscriptions = subscriptions
        , view = view
        }



-- MODEL


type alias Model =
    Result Error { message : String }


init : Value -> ( Model, Cmd Msg )
init flags =
    let
        result =
            Decode.decodeValue
                (Decode.field "props"
                    (Decode.map
                        (\message ->
                            { message = message
                            }
                        )
                        (Decode.field "message" Decode.string)
                    )
                )
                flags
    in
    ( result, Cmd.none )



-- UPDATE


type Msg
    = NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    case model of
        Ok { message } ->
            text message

        Err error ->
            text (error |> Decode.errorToString)
