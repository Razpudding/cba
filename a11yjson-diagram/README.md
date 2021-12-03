# A11yjson diagram
Figuring out the hierarchy of the A11yJSON interfaces was (and is) a bit of a struggle. So I'll try to visually reflect the nesting of the interfaces here.

## TODO
- Read up on mermaid diagram options and styling

## Mermaid
I'd like to use Mermaid for this. Looks like Github doesn't support it yet but [stackedit.io](https://stackedit.io/app#) can be used as a WYSIWYG editor.

## A11yJSON Diagram
```mermaid
classDiagram
      PlaceInfo <|-- PlaceProperties
      PlaceProperties <|-- Accessibility
      Accessibility <|-- Entrance
      Accessibility <|-- Parking
      Accessibility <|-- Restroom
      Accessibility <|-- Ground
      Accessibility <|-- Floor
      Entrance <|-- Door
      Entrance <|-- Stairs
      Restroom <|-- Entrance
      Parking <|-- WheelchairParking
      Floor <|-- Stairs
      
      class PlaceInfo{
		properties: PlaceProperties          
      }
      class PlaceProperties{
		+accessibility: Accessibility
      }
      class Accessibility{
		+entrances: Entrance[]
		+restrooms: Restroom[]
		+door: Door
		+stairs: Stairs
		+parking: Parking
		?floors: Floor[]
      }
      class Entrance{
	    +door: Door
      }
```

[Mermaid docs](https://mermaid-js.github.io/mermaid/#/)
Alternatively it's possible to [integrate draw.io](https://drawio.freshdesk.com/support/solutions/articles/16000042371-embed-a-diagram-in-github-markdown) in github