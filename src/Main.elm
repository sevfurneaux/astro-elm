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
    Result Error { message : String, counter : Int }


init : Value -> ( Model, Cmd Msg )
init flags =
    let
        result =
            Decode.decodeValue
                (Decode.field "props"
                    (Decode.map
                        (\message ->
                            { message = message
                            , counter = 0
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
    = Increment
    | Decrement


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model of
        Ok params ->
            case msg of
                Increment ->
                    ( Ok { params | counter = params.counter + 1 }
                    , Cmd.none
                    )

                Decrement ->
                    ( Ok
                        { params
                            | counter =
                                if params.counter > 0 then
                                    params.counter - 1

                                else
                                    0
                        }
                    , Cmd.none
                    )

        Err _ ->
            ( model, Cmd.none )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none



-- VIEW


view : Model -> Html Msg
view model =
    case model of
        Ok { message, counter } ->
            div []
                [ h1 [] [ text message ]
                , h2 [] [ text ("Counter: " ++ String.fromInt counter) ]
                , button [ onClick Increment ]
                    [ text "Increment" ]
                , button
                    [ onClick Decrement
                    , disabled
                        (if counter == 0 then
                            True

                         else
                            False
                        )
                    ]
                    [ text "Decrement" ]
                ]

        Err error ->
            text (error |> Decode.errorToString)
